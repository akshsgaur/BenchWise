import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-01",
    azure_endpoint=os.getenv("ENDPOINT_URL")
)

# Test with different deployment names
deployment_names = ["gpt-4o", "gpt-4", "gpt-35-turbo", "gpt-4-turbo"]

for deployment in deployment_names:
    print(f"\n Testing deployment: {deployment}")
    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "Say 'Hello' if you can read this"}],
            max_tokens=10
        )
        print(f"✅ SUCCESS with {deployment}!")
        print(f"   Response: {response.choices[0].message.content}")
        print(f"\n   USE THIS DEPLOYMENT NAME: {deployment}")
        break
    except Exception as e:
        print(f"❌ Failed: {e}")
