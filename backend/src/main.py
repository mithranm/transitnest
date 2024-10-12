from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI()

"""
Requirements
/house/search - this endpoint will use an llm with aggregated data as context to find the best house. (we choose model later)
/graph/historic_price - this endpoint will create a gradio or streamlit embedded within our react page
"""

class UserParameters(BaseModel):
    budget: int
    credit_score: int
    dist_from_public_transport: int # will be in miles.
    length_of_loan: int # will be in years.
    work_zipcode: int

"""
This endpoint will return the best ranking house with the given parameters from the frontend.
Frontend must form a POST request with the following json formatted body:
{
    "budget": int,
    "credit_score": int,
    "dist_from_public_transport": int,
    "length_of_loan": int
}
"""
@app.post("/house/search")
def search(user_params: UserParameters):
    # Steps for this function.
    budget: int = user_params.budget
    dist: int = user_params.dist_from_public_transport
    zipcode: int = user_params.work_zipcode 
    # We want to be able to use these two variables to rank the best real estate options.

    credit_score: int = user_params.credit_score
    length_of_loan: int = user_params.length_of_loan

    print(f"budget {budget}, preferred distence from public transport: {dist}, work zipcode: {zipcode}, credit score: {credit_score}, length of loan {length_of_loan}") # ensuring all values are being received.

    # Pass in budget, dist, zipcode into llm to get the best real estate.

    def chat_llm():
        # This will send a post request to chat_llm.
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "hello claude!"
                        }
                    ]
                }
            ]
        }

        return requests.post("arn:aws:bedrock:us-east-2:809111791479:inference-profile/us.anthropic.claude-3-5-sonnet-20240620-v1:0", data=payload) # this will be hosted on aws bedrock.

    response = chat_llm()
    print(response.json())

    pass


@app.get("/graph/historic_price")
def get_historic_price():

    # Code here (mithran)

    pass