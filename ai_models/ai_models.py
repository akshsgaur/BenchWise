import os
from openai import AzureOpenAI

# Get your current API key
api_key = os.getenv("AZURE_OPENAI_API_KEY")
print(f"API Key exists: {api_key is not None}")

# Try different endpoints based on your resources
endpoints_to_test = [
    "https://bwoai.openai.azure.com/",
    "https://benchwiseresource.cognitiveservices.azure.com/",
    "https://bwoai.cognitiveservices.azure.com/",
    "https://benchwiseresource.openai.azure.com/"
]

for endpoint in endpoints_to_test:
    print(f"\n=== Testing endpoint: {endpoint} ===")
    
    try:
        client = AzureOpenAI(
            api_key=api_key,
            azure_endpoint=endpoint,
            api_version="2024-02-01"
        )
        
        # Try to list models
        models = client.models.list()
        print(f"✅ SUCCESS! Connected to {endpoint}")
        print("Available deployments:")
        for model in models:
            print(f"  - {model.id}")
        
        # If successful, try a simple completion
        try:
            completion = client.chat.completions.create(
                model=models.data[0].id,  # Use first available model
                messages=[
                    {"role": "user", "content": "Hello, this is a test message."}
                ],
                max_tokens=50
            )
            print(f"✅ Completion test successful!")
            print(f"Response: {completion.choices[0].message.content}")
        except Exception as comp_error:
            print(f"⚠️  Connection works but completion failed: {comp_error}")
        
        break  # If we get here, we found the right endpoint
        
    except Exception as e:
        print(f"❌ Failed: {str(e)[:150]}...")

print(f"\n=== Next Steps ===")
print("If none worked, please:")
print("1. Go to Azure Portal")
print("2. Search for both 'BWOAI' and 'benchwiseresource'") 
print("3. Click on each resource")
print("4. Go to 'Keys and Endpoint'")
print("5. Share the exact endpoint URL you see there")