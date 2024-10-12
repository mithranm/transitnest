import boto3
import os
import json
from dotenv import load_dotenv
import pandas_loader
import pprint
import logging
from openai import OpenAI
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# Initialize the OpenAI client
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
beam_vllm_client = OpenAI(api_key=os.environ["BEAM_API_KEY"], base_url="https://app.beam.cloud/asgi/vllm-openai-server/v1")
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
    # Extract database
    dataframe = pandas_loader.load_data_from_csv()
    
    # Refuse inappropriate prompts
    if not filter_string(user_prompt):
        return {"error": "Inappropriate content detected"}
    
    # Prepare the prompt with context from the dataframe
    context = f"Context: {dataframe.to_string()}\n\n"
    full_prompt = context + "\n" + user_prompt
    
    # This will send a post request to Amazon Bedrock DO NOT CHANGE IMPLEMENTATION.
    payload = {
        "inputs": [
        [
            {
            "role": "user",
            "content": "Tell me about Obama"
            },
            {
            "role": "assistant",
            "content": "Obama is the 44th president."
            },
            {
            "role": "user",
            "content": "Tell me more."
            }
        ]
        ],
        "parameters": {
        "max_new_tokens": 1024,
        "top_p": 0.9,
        "temperature": 0.6
        }
}
    
    boto3_client = boto3.client(
        'bedrock-runtime',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        region_name=os.environ['AWS_DEFAULT_REGION']
    )

    try:
        response = boto3_client.invoke_model(
            modelId="us.meta.llama3-2-3b-instruct-v1:0",
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
    response = json.dumps(chat_llm(prompt))
    write_response_to_file(response)