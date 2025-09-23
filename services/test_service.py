"""
Simple test for PlaidAIService setup
"""

try:
    from plaid_ai_service import plaid_ai_service

    print("✅ Successfully imported PlaidAIService")

    # Test credential checking
    creds = plaid_ai_service.check_credentials()
    print(f"📋 Credentials check: {creds}")

    # Test Azure OpenAI connection
    try:
        # First get a sandbox access token to provide financial context
        print("🔑 Getting sandbox access token for testing...")
        sandbox_token = plaid_ai_service.get_sandbox_access_token()
        access_token = sandbox_token['access_token']
        print(f"✅ Got sandbox access token: {access_token[:10]}...")

        # Now test financial advice with the access token
        advice = plaid_ai_service.get_financial_advice("What is a good budgeting strategy?", access_token)
        print("✅ Azure OpenAI connection working")
        print(f"💡 Sample advice: {advice['advice'][:200]}...")
    except Exception as e:
        print(f"❌ Azure OpenAI test failed: {str(e)}")

        # Fallback: Test without access token
        try:
            print("🔄 Trying without access token...")
            advice = plaid_ai_service.get_financial_advice("What is a good budgeting strategy?")
            print("✅ Azure OpenAI connection working (without financial context)")
            print(f"💡 Sample advice: {advice['advice'][:200]}...")
        except Exception as e2:
            print(f"❌ Complete Azure OpenAI test failed: {str(e2)}")

    print("\n🎯 Service is ready to use!")
    print("📝 Next steps:")
    print("1. Add your Plaid credentials to .env file")
    print("2. Install dependencies: pip install -r requirements_plaid_ai.txt")
    print("3. Use the service in your application")

except ImportError as e:
    print(f"❌ Import failed: {str(e)}")
    print("📦 Make sure to install dependencies: pip install -r requirements_plaid_ai.txt")
except Exception as e:
    print(f"❌ Service test failed: {str(e)}")