# main.py

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, validator, model_validator
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
from prompt_library import smart_multiturn_prompt_llm
from pandas_loader import load_data_from_csv
import search_algorithm
from typing import List, Dict, Any, Optional
import logging
import traceback
import json  # Import json for serialization
from rate_limiter import RateLimitMiddleware  # Import the middleware
import base64
from logging.handlers import RotatingFileHandler
from PIL import Image
from io import BytesIO


# Initialize FastAPI app

rate_limits = {
    "/house_search": {"limit": 10, "window": 60},          # 10 requests per 60 seconds
    "/get_properties": {"limit": 20, "window": 60},        # 20 requests per 60 seconds
    "/chat": {"limit": 20, "window": 60},                  # 20 requests per 60 seconds
    "/graph_historic_price": {"limit": 5, "window": 60},    # 5 requests per 60 seconds
    "/": {"limit": 100, "window": 60},                      # 100 requests per 60 seconds
}

app = FastAPI()
app.add_middleware(RateLimitMiddleware, limits=rate_limits)
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Consider restricting in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create formatters
file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# File handler (with rotation)
file_handler = RotatingFileHandler('app.log', maxBytes=10*1024*1024, backupCount=5)  # 10MB per file, keep 5 backups
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(file_formatter)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(console_formatter)

# Add handlers to logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Load dataframes
METRO_DATAFRAME, PROPERTY_DATAFRAME, ZIP_DATAFRAME = load_data_from_csv()

"""
Requirements
/house_search - This endpoint will use an LLM with aggregated data as context to find the best house. (Model choice pending)
/graph/historic_price - This endpoint will create a Gradio or Streamlit app embedded within our React page
"""

# Pydantic Models for /house_search
class UserParameters(BaseModel):
    budget: int
    credit_score: int
    dist_from_public_transport: int
    length_of_loan: int
    work_zipcode: int

# Pydantic Models for /chat

class ImageSource(BaseModel):
    bytes: str

class ImageContent(BaseModel):
    format: str
    source: ImageSource

class ContentItem(BaseModel):
    text: Optional[str] = None
    image: Optional[ImageContent] = None

    @model_validator(mode='after')
    def at_least_one_field_must_be_set(cls, model):
        if not model.text and not model.image:
            raise ValueError('At least one of "text" or "image" must be provided in ContentItem')
        return model

class Message(BaseModel):
    role: str
    content: List[ContentItem]

    @validator('role')
    def role_must_be_valid(cls, v):
        if v not in {"user", "assistant"}:
            raise ValueError('Role must be either "user" or "assistant"')
        return v

class MultiPromptRequest(BaseModel):
    messages: List[Message]

@app.get("/get_properties")
def get_property_dataframe_json(budget=5000, maxDistance=2, workZip=22030):
    if budget=='':
        budget=5000
    if maxDistance=='':
        maxDistance=2
    if workZip=='':
        workZip=22030

    output = search_algorithm.run_search_algorithm(float(budget), float(maxDistance), int(workZip))
    return output

def scale_image(image_bytes, max_size=(1000, 1000)):
    # Open the image from bytes
    img = Image.open(BytesIO(image_bytes))
    
    # Resize the image
    img.thumbnail(max_size)
    
    # Save the resized image to bytes
    output_buffer = BytesIO()
    img.save(output_buffer, format=img.format)
    
    # Return the bytes of the scaled image
    return output_buffer.getvalue()

@app.post("/chat")
def chat(request: MultiPromptRequest):
    try:
        # Convert the Pydantic model to a dict
        payload = request.model_dump()

        # Log the received payload for debugging
        logger.info(f"Received /chat payload: {payload}")

        # Extract the 'messages' list
        messages = payload.get('messages', [])
        logger.info(f"Extracted messages: {messages}")

        # Process messages, handling images
        processed_messages = []
        for message in messages:
            role = message['role']
            content_list = message['content']
            processed_content_list = []
            for content_item in content_list:
                if 'text' in content_item and content_item['text'] is not None:
                    processed_content_list.append({'text': content_item['text']})
                if 'image' in content_item and content_item['image'] is not None:
                    image_content = content_item['image']
                    logger.info(f"yada yada {image_content}")
                    image_bytes = image_content['source']['bytes']
                    # Decode the base64 image data
                    image_data = base64.b64decode(image_bytes)
                    scaled_image_bytes = scale_image(image_data)
                    processed_content_list.append(
                        {
                            'image': {
                                'format': content_item['image']['format'],
                                'source': {
                                    'bytes': scaled_image_bytes
                                }
                            }
                        }
                    )
                else:
                    # Handle invalid content item
                    logger.warning(f"Invalid content item: {content_item}")
            processed_messages.append({'role': role, 'content': processed_content_list})

        logger.info(f"Processed messages for LLM: {processed_messages}")

        # Pass the processed messages to the LLM function
        response = smart_multiturn_prompt_llm(processed_messages)

        # Log the LLM response
        logger.info(f"LLM Response: {response}")

        # Extract the 'output' field
        output = response.get("output", "Sorry, I couldn't process your request.")

        # Wrap the output in a message structure
        assistant_message = {
            "role": "assistant",
            "content": [{"text": output['message']['content'][0]['text']}]
        }

        # Return the message object
        return {"message": assistant_message}
    except Exception as e:
        logger.error(f"Error processing /chat request: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/graph_historic_price")
def get_historic_price():
    # TODO: Implement the historic price graph functionality
    return {"message": "Historic price graph functionality not yet implemented."}

@app.get("/")
def health():
    return {"message": "healthy"}

if __name__ == "__main__":
    logger.info(f"Metro DataFrame 'X' column: {METRO_DATAFRAME['X']}")
