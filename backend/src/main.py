# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
from prompt_library import multiturn_prompt_llm
from pandas_loader import load_data_from_csv
import search_algorithm
from typing import List, Dict, Any
import logging
import traceback
import json  # Import json for serialization

# Initialize FastAPI app
app = FastAPI()

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
    dist_from_public_transport: int  # in miles
    length_of_loan: int  # in years
    work_zipcode: int

# Pydantic Models for /chat
class ContentItem(BaseModel):
    text: str

class Message(BaseModel):
    role: str
    content: List[ContentItem]

    @validator('role')
    def role_must_be_valid(cls, v):
        if v not in {"user", "assistant"}:
            raise ValueError('role must be either "user" or "assistant"')
        return v

class MultiPromptRequest(BaseModel):
    messages: List[Message]

"""
/house_search Endpoint
Returns the best-ranking house based on user parameters.
Expects a POST request with a JSON body:
{
    "budget": int,
    "credit_score": int,
    "dist_from_public_transport": int,
    "length_of_loan": int,
    "work_zipcode": int
}
"""
@app.post("/house_search")
def search(user_params: UserParameters):
    # Extract parameters
    budget = user_params.budget
    dist = user_params.dist_from_public_transport
    zipcode = user_params.work_zipcode
    credit_score = user_params.credit_score
    length_of_loan = user_params.length_of_loan

    logger.info(f"Received search parameters: Budget={budget}, Distance={dist} miles, Zipcode={zipcode}, Credit Score={credit_score}, Loan Length={length_of_loan} years")

    # TODO: Implement the logic to use LLM and return the best house
    # Example placeholder response
    best_house = {
        "address": "123 Main St",
        "price": budget - 10000,
        "distance_from_transport": dist,
        "zipcode": zipcode,
        "credit_score_required": credit_score,
        "loan_length": length_of_loan
    }

    return {"best_house": best_house}

@app.get("/get_properties")
def get_property_dataframe_json():
    return search_algorithm.get_property_dataframe_json()

@app.post("/chat")
def chat(request: MultiPromptRequest):
    try:
        # Convert the Pydantic model to a dict
        payload = request.dict()

        # Log the received payload for debugging
        logger.info(f"Received /chat payload: {payload}")

        # Extract the 'messages' list
        messages = payload.get('messages', [])
        logger.info(f"Extracted messages: {messages}")

        # Pass only the 'messages' list to the LLM function
        response = multiturn_prompt_llm(messages)

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

if __name__ == "__main__":
    logger.info(f"Metro DataFrame 'X' column: {METRO_DATAFRAME['X']}")
