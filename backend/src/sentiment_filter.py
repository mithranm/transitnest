import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

class SentimentBasedFilter:
    def __init__(self):
        # Download necessary NLTK data
        nltk.download('vader_lexicon', quiet=True)
        self.sia = SentimentIntensityAnalyzer()

    def analyze_text(self, text):
        # Get sentiment scores
        sentiment_scores = self.sia.polarity_scores(text)
        
        # We'll focus on the compound score, which is a sum of all the lexicon ratings
        # normalized between -1 (most extreme negative) and +1 (most extreme positive)
        compound_score = sentiment_scores['compound']
        
        # Classify the text based on the compound score
        if compound_score <= -0.5:
            return "Potentially offensive", compound_score
        elif compound_score <= -0.1:
            return "Negative", compound_score
        elif compound_score >= 0.5:
            return "Very positive", compound_score
        elif compound_score >= 0.1:
            return "Positive", compound_score
        else:
            return "Neutral", compound_score

    def is_clean(self, text):
        classification, score = self.analyze_text(text)
        return classification != "Potentially offensive"

    def censor_if_needed(self, text):
        classification, score = self.analyze_text(text)
        if classification == "Potentially offensive":
            return '[This text has been censored due to potentially offensive content]'
        return text

# Example usage
if __name__ == "__main__":
    filter = SentimentBasedFilter()
    
    test_strings = [
        "You are a wonderful person.",
        "I hate you, you're the worst!",
        "The weather is nice today.",
        "This product is absolutely terrible and useless.",
        "I'm feeling neutral about this situation."
    ]
    
    for string in test_strings:
        classification, score = filter.analyze_text(string)
        print(f"Text: {string}")
        print(f"Classification: {classification}")
        print(f"Sentiment Score: {score}")
        print(f"Is clean: {filter.is_clean(string)}")
        print(f"Censored version: {filter.censor_if_needed(string)}")
        print()