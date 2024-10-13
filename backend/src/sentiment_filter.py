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
        
        return compound_score

    def is_clean(self, text):
        score = self.analyze_text(text)
        return score > -0.5, score

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
        print()