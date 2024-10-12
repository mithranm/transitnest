import boto3
import os
import json
from dotenv import load_dotenv
import pandas_loader
import pprint
import logging
from openai import OpenAI
from botocore.config import Config
import base64

load_dotenv()

boto3_config = Config(
            region_name = os.environ["AWS_DEFAULT_REGION"]
            )

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# Initialize the OpenAI client

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
# boto3_client = boto3.client(
#         'bedrock-runtime',
#         aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
#         aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
#         region_name=os.environ['AWS_DEFAULT_REGION']
#     )

boto3_client = boto3.client(
    "bedrock-runtime", config=boto3_config
)
BOTO3_MODEL_ID_VISION = "us.meta.llama3-2-11b-instruct-v1:0"
BOTO3_MODEL_ID_CHAT =  "us.meta.llama3-2-3b-instruct-v1:0"

dataframe = pandas_loader.load_data_from_csv() #TODO: Change this

def filter_string(user_prompt: str) -> bool:
    try:
        # Call OpenAI's moderation endpoint
        response = openai_client.moderations.create(
            model="text-moderation-latest",
            input=user_prompt
        )
        
        # Check if the prompt is flagged as inappropriate
        result = response.results[0]
        
        # If any category is flagged, return False (inappropriate)
        return not result.flagged
    
    except Exception as e:
        print(f"Error occurred while filtering: {str(e)}")
        # In case of an error, we'll err on the side of caution and flag the prompt
        return False

def single_prompt_llm(user_prompt: str) -> dict:
    """
    Returns a Dictionary containing the LLM response.
    """
    
    # Refuse inappropriate prompts
    if not filter_string(user_prompt):
        return {"error": "Inappropriate content detected"}
    
    # Prepare the prompt with context from the dataframe
    context = f"Context: {dataframe.to_string()}\n\n"
    full_prompt = context + "\n" + user_prompt
    
    # This will send a post request to Amazon Bedrock DO NOT CHANGE IMPLEMENTATION.
    payload = {
        "prompt": full_prompt
    }

    try:
        response = boto3_client.invoke_model(
            modelId=BOTO3_MODEL_ID_CHAT,
            body=json.dumps(payload)
        )
        
        # Parse the JSON response
        response_data = json.loads(response['body'].read().decode('utf-8'))
        
        # Log the full response for analysis
        logging.info("Full API Response:")
        logging.info(pprint.pformat(response_data))
        
        # Analyze and log specific parts of the response
        if isinstance(response_data, dict):
            for key, value in response_data.items():
                logging.info(f"Key: {key}")
                logging.info(f"Value type: {type(value)}")
                logging.info(f"Value preview: {str(value)[:100]}...")  # Preview first 100 characters
        
        return response_data
    except Exception as e:
        error_response = {"error": str(e)}
        logging.error(f"Error occurred: {error_response}")
        return error_response
    
def multiturn_prompt_llm(messages: dict) -> dict:
    # user_prompt = "We have to scan all strings in the messages and iterative over them"
    # # Refuse inappropriate prompts
    # if not filter_string(user_prompt):
    #     return {"error": "Inappropriate content detected"}
    
    # Prepare the prompt with context from the dataframe
    context = f"Context: {dataframe.to_string()}\n\n"
    # full_prompt = context + "\n" + user_prompt #TODO: Fix this
    image_path = "changeme.jpeg"  #TODO: Replace with the actual path to your image
    
    try:
        # Open the image file and read its contents
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
        # Encode the image bytes to base64
        image_data = image_bytes
    except FileNotFoundError:
        print(f"Image file not found at {image_path}")
        image_data = None
        
        
    # Construct the messages for the model input
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "text": "Tell me about Obama"
                }
            ]
        },
        {
            "role": "assistant",
            "content": [
                {
                    "text": "Obama was the 44th president."
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "text": "Tell me more"
                }
            ]
        },
    ]
    
    response = boto3_client.converse(
        modelId=BOTO3_MODEL_ID_CHAT, # MODEL_ID defined at the beginning
        messages=messages,
        inferenceConfig={
        "maxTokens": 512,
        "temperature": 0,
        "topP": .1
        }, 
    )
    
    print(response['output']['message']['content'][0]['text'])
    
    return response
    
def write_response_to_file(response_data, filename="llm_response.json"):
    try:
        # Get the current directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Create the path for one directory up
        parent_dir = os.path.dirname(current_dir)
        
        # Combine the parent directory path with the filename
        file_path = os.path.join(parent_dir, filename)
        
        # Parse the input string as JSON if it's a string
        if isinstance(response_data, str):
            try:
                response_data = json.loads(response_data)
            except json.JSONDecodeError:
                # If it's not valid JSON, wrap it in a dictionary
                response_data = {"content": response_data}
        
        # Write the data to a JSON file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(response_data, f, indent=2, ensure_ascii=False)
        
        print(f"Response written to {file_path}")
    except Exception as e:
        print(f"Error writing to file: {str(e)}")

if __name__ == "__main__":
    prompt = "Can you tell me about this dataframe?"
    response = multiturn_prompt_llm({})
    write_response_to_file(response)