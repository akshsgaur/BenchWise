import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("AZURE_OPENAI_API_KEY")
endpoint = os.getenv("ENDPOINT_URL").rstrip('/')

print(f"Endpoint: {endpoint}")
print(f"API Key: {api_key[:20]}...\n")

# List all deployments - try different API versions
api_versions = ["2024-08-01-preview", "2024-02-01", "2023-05-15"]

for api_version in api_versions:
    url = f"{endpoint}/openai/deployments?api-version={api_version}"
    print(f"📡 Trying API version: {api_version}")

    headers = {
        "api-key": api_key
    }

    try:
        response = requests.get(url, headers=headers)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if 'data' in data and len(data['data']) > 0:
                print("\n✅ DEPLOYMENTS FOUND:")
                for deployment in data['data']:
                    name = deployment.get('id', deployment.get('model', 'Unknown'))
                    model = deployment.get('model', 'Unknown')
                    print(f"  📌 Deployment Name: {name}")
                    print(f"     Model: {model}")
                    print(f"\n  👉 USE THIS IN .env: DEPLOYMENT_NAME={name}")
                break
            else:
                print("   No deployments found")
        else:
            print(f"   Error: {response.text[:150]}")

    except Exception as e:
        print(f"   Exception: {e}")

print("\n\n💡 If no deployments found, please:")
print("   1. Go to https://portal.azure.com")
print("   2. Search for 'bwoai'")
print("   3. Click 'Model deployments'")
print("   4. Note the deployment name")
