from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import pandas as pd
from .prompt_refusal import chat_llm

app = FastAPI()

load_dotenv()

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

@app.post("/house_search")
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

    #response = chat_llm()
    #print(response["body"].read()) # This is how to get the response from the llm.

    pass


@app.get("/graph_historic_price")
def get_historic_price():


    # Code here (mithran)

    pass