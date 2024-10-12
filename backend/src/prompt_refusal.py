import boto3
import os
import json
from dotenv import load_dotenv

load_dotenv()
def chat_llm():
    # Extract database.
    


    # This will send a post request to chat_llm.
    payload = {
        "prompt": "can you list the stations in fairfax?"
    }
    
    client = boto3.client(
        'bedrock-runtime',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        region_name=os.environ['AWS_DEFAULT_REGION']
    )

    response = client.invoke_model(
        modelId="us.meta.llama3-2-3b-instruct-v1:0",
        body=json.dumps(payload)
    )

    return response

if __name__ == "__main__":
    print('hello world')