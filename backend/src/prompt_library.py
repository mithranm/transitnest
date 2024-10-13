import boto3
import os
import json
from dotenv import load_dotenv
import pandas_loader
import pprint
import logging
from openai import OpenAI
from botocore.config import Config
from typing import List, Dict, Any
import base64
from sentiment_filter import SentimentBasedFilter
import requests

load_dotenv()

boto3_config = Config(
            region_name = os.environ["AWS_DEFAULT_REGION"]
            )

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SENTIMENT_FILTER = SentimentBasedFilter()


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
azure_openai_client = OpenAI(api_key=os.environ["AZURE_KEY"], base_url="https://izdar.openai.azure.com/")
perplexity_client = OpenAI(api_key=os.environ["PERPLEXITY_API_KEY"], base_url="https://api.perplexity.ai")
BOTO3_MODEL_ID_VISION = "us.meta.llama3-2-11b-instruct-v1:0"
BOTO3_MODEL_ID_CHAT =  "us.meta.llama3-2-3b-instruct-v1:0"

def string_is_clean(user_prompt: str) -> bool:
    is_clean, score = SENTIMENT_FILTER.is_clean(text=user_prompt)
    logger.info(f"IS_CLEAN {is_clean} SCORE {score}")
    return is_clean
    
def moderate_string(user_prompt: str) -> bool:
    try:
        # Call OpenAI's moderation endpoint
        response = openai_client.moderations.create(
            model="text-moderation-latest",
            input=user_prompt
        )
        
        # Check if the prompt is flagged as inappropriate
        result = response.results[0]
        
        if result.flagged:
            logger.info("asdf Flagged")
        else:
            logger.info("asdf Not Flagged")
        
        # If any category is flagged, return False (inappropriate)
        return not result.flagged
    
    except Exception as e:
        print(f"Error occurred while filtering: {str(e)}")
        # In case of an error, we'll err on the side of caution and flag the prompt
        return False

def single_prompt_llm(user_prompt: str) -> dict:
    """
    Returns a Dictionary with [generation] as they key
    This method is nearly useless I haven't gotten good output from it
    """
    
    # Refuse inappropriate prompts
    if not string_is_clean(user_prompt):
        return {"error": "Inappropriate content detected"}
    
    # This will send a post request to Amazon Bedrock DO NOT CHANGE IMPLEMENTATION.
    payload = {
        "prompt": user_prompt
    }

    try:
        response = boto3_client.invoke_model(
            modelId=BOTO3_MODEL_ID_CHAT,
            body=json.dumps(payload)
        )
        
        # Parse the JSON response
        response_data = json.loads(response['body'].read().decode('utf-8'))
        
        # Log the full response for analysis
        logger.info("Full API Response:")
        logger.info(pprint.pformat(response_data))
        
        # Analyze and log specific parts of the response
        if isinstance(response_data, dict):
            for key, value in response_data.items():
                logger.info(f"Key: {key}")
                logger.info(f"Value type: {type(value)}")
                logger.info(f"Value preview: {str(value)[:100]}...")  # Preview first 100 characters
        
        return response_data
    except Exception as e:
        error_response = {"error": str(e)}
        logger.error(f"Error occurred: {error_response}")
        return error_response
    
    
def recursive_search(d, key):
    if key in d:
        return True
    for k, v in d.items():
        if isinstance(v, dict):
            if recursive_search(v, key):
                return True
        elif isinstance(v, list):
            for item in v:
                if isinstance(item, dict):
                    if recursive_search(item, key):
                        return True
    return False

def contains_image_key_recursive(messages):
    for message in messages:
        if recursive_search(message, 'image'):
            return True
    return False

def multiturn_prompt_llm(messages: List[Dict[str, Any]]) -> Dict:
    """
    Process multi-turn prompts for an LLM, including text and image inputs.

    Arguments: messages in this format
    messages = [    
        {
            "role": "user",
            "content": [
                {                
                    "text": prompt
                },
                {                
                    "image": {
                        "format": "<your_file_format>",
                        "source": {
                            "bytes":image_data
                        }
                    }
                }
            ]
        }
    ]
    """
    
    inappropriate_contents = []  # To store all inappropriate texts found

   # Iterate through each message
    for idx, message in enumerate(messages):
        logger.info(f"Message: {message}")
        role = message.get('role', 'unknown')
        logger.debug(f"Processing message {idx} with role: {role}")
        
        # Iterate through each content block within the message
        for content_idx, content in enumerate(message.get('content', [])):
            if 'text' in content:
                text = content['text']
                logger.debug(f"Checking text content {content_idx} in message {idx}: {text}")
                if not string_is_clean(text):
                    logger.warning(f"Inappropriate content detected in message {idx}, content {content_idx}: {text}")
                    inappropriate_contents.append(text)
            elif 'image' in content:
                logger.debug(f"Processing image content {content_idx} in message {idx}: {content['image']}")
                # TODO: Implement image moderation if necessary
            else:
                logger.warning(f"Unknown content type in message {idx}, content {content_idx}: {content}")

    # After scanning all messages, check if any inappropriate content was found
    if inappropriate_contents:
        # You can customize the exception message as needed
        raise ValueError(f"Inappropriate content detected: {inappropriate_contents}")
    
    # Detect if messages contains images and set the flag
    contains_image = contains_image_key_recursive(messages)
    logger.info("Contains Image" + str(contains_image))
    # Select the appropriate model ID based on the presence of images
    model_id = BOTO3_MODEL_ID_VISION if contains_image else BOTO3_MODEL_ID_CHAT
    logger.info("Model ID " + model_id)
    response = boto3_client.converse(
        modelId=model_id,
        messages=messages,
        inferenceConfig={
            "maxTokens": 2048,
            "temperature": 0,
            "topP": 0.1
        }, 
    )
    
    logger.info(response['output']['message']['content'][0]['text'])
    
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

def read_image_file(file_path):
    with open(file_path, "rb") as image_file:
        return image_file.read()
    
def query_perplexity(chat_history):
    messages = [
            {
                "role": "system",
                "content": "An offline LLM needs more information to answer the User's query. You are given the entire chat history."
            },
            {
                "role": "user",
                "content": f"Chat History: {chat_history}\n."
            }
        ]
    
    return perplexity_client.chat.completions.create(model="llama-3.1-sonar-small-128k-online", messages=messages)

def flatten_messages(messages):
    flattened = []
    for message in messages:
        if "content" in message:
            for content in message["content"]:
                if "text" in content:
                    flattened.append(content["text"])
    return " ".join(flattened)

def create_messages_for_classification(classification_prompt: str, user_prompt: str) -> List[Dict[str, Any]]:
    messages = [
            {
                "role": "system",
                "content": classification_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    return messages
    

def smart_multiturn_prompt_llm(messages: List[Dict[str, Any]]) -> Dict:
    user_prompt = messages[-1]["content"][0]["text"]
    print(f"user_prompt: {user_prompt}")
    
    is_relevant_response = openai_client.chat.completions.create(model="gpt-4o-mini", messages=
        create_messages_for_classification(
            "Classify the GIVEN TEXT as related rental properties or evaluating an area of living? Do not be too strict and greetings like Hello should be given a YES. STRICTLY RESPOND WITH YES OR NO",
            user_prompt
        )
    )
    print(f"is_relevant_response: {is_relevant_response}")
    is_relevant = "yes" in is_relevant_response.choices[0].message.content.lower()
    if not is_relevant:
        response = {
            "output": {
                "message": {
                "content": [
                    {
                    "text": "Sorry, that's not a relevant question."
                    }
                ]
                }
            }
        }
        return response
    
    internet_needed_response_raw = multiturn_prompt_llm(messages)
    needs_info_response = openai_client.chat.completions.create(model="gpt-4o-mini", messages=
        create_messages_for_classification(
            "Does this LLM response indicate it needs more information to answer the prompt, such as information from the internet? STRICTLY RESPOND WITH YES OR NO",
            internet_needed_response_raw['output']['message']['content'][0]['text']
        )
    )
    needs_info = "yes" in needs_info_response.choices[0].message.content.lower()
    if needs_info:
        messages.append(
                {
                "role": "assistant",
                "content": [
                    {                
                        "text": internet_needed_response_raw['output']['message']['content'][0]['text']
                    }
                ]
            }
        )
        context = query_perplexity(flatten_messages(messages))
        logger.info(f"Perplexity Context\n {context}")
        messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "text": f"Here is additional context to help you answer my question \n {context}"
                    }
                ]
            }
        )
        return multiturn_prompt_llm(messages)
    else:
        return internet_needed_response_raw

    
if __name__ == "__main__":
    # Test case 1: Text-only input
    # text_only_messages = [
    #     {
    #         "role": "user",
    #         "content": [
    #             {
    #                 "text": "Hello, how are you?"
    #             }
    #         ]
    #     }
    # ]
    # print("Test case 1: Text-only input")
    # result = multiturn_prompt_llm(text_only_messages)
    # print(f"Result: {result}\n")

    # Test case 2: Text and image input
    
    # current_dir = os.path.dirname(os.path.abspath(__file__))
    # image_path = os.path.join(current_dir, '..', 'mystery.jpeg')
    # image_bytes = read_image_file(image_path)
    # logger.info("Bruh " + str(image_bytes))
    # text_and_image_messages = [
    #     {
    #         "role": "user",
    #         "content": [
    #             {
    #                 "text": "What's in this image?"
    #             },
    #             {
    #                 "image": {
    #                     "format": "jpeg",
    #                     "source": {
    #                         "bytes": image_bytes
    #                     }
    #                 }
    #             }
    #         ]
    #     }
    # ]
    # print("Test case 2: Text and image input")
    # result = multiturn_prompt_llm(text_and_image_messages)
    # print(f"Result: {result}\n")
    # write_response_to_file(result)

    # Test case 3: Inappropriate content
    inappropriate_messages = [
        {
            "role": "user",
            "content": [
                {
                    "text": "Fuck."
                }
            ]
        }
    ]
    print("Test case 3: Inappropriate content")
    try:
        result = multiturn_prompt_llm(inappropriate_messages)
    except ValueError as e:
        print(f"Caught expected ValueError: {e}\n")
    