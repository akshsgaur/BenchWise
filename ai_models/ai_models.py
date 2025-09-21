from openai import OpenAI

endpoint = "https://bwoai.openai.azure.com/openai/v1/"
deployment_name = "gpt-4.1"
api_key = "CFy53HPagpkJAAZM0AN4TCVgRFWES7hykM5BA4KojWacw6nDnP1aJQQJ99BIACHYHv6XJ3w3AAABACOGK5uk"

client = OpenAI(
    base_url=endpoint,
    api_key=api_key
)

completion = client.chat.completions.create(
    model=deployment_name,
    messages=[
        {
            "role": "user",
            "content": "What is the capital of France?",
        }
    ],
)

print(completion.choices[0].message)