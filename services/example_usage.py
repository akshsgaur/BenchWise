"""
Example usage of the PlaidAIService

This file demonstrates how to use the Plaid AI Service with Azure OpenAI integration.
"""

from plaid_ai_service import plaid_ai_service

def main():
    # Check if credentials are configured
    print("Checking credentials...")
    creds_status = plaid_ai_service.check_credentials()
    print(f"Credentials status: {creds_status}")

    if not creds_status['plaid_configured']:
        print("Please configure your Plaid credentials in the .env file")
        return

    if not creds_status['azure_configured']:
        print("Please configure your Azure OpenAI credentials in the .env file")
        return

    try:
        # Example 1: Create a sandbox access token (for testing)
        print("\n1. Creating sandbox access token...")
        sandbox_token = plaid_ai_service.get_sandbox_access_token()
        access_token = sandbox_token['access_token']
        print(f"Sandbox access token created: {access_token[:10]}...")

        # Example 2: Get account information
        print("\n2. Getting account information...")
        accounts = plaid_ai_service.get_accounts(access_token)
        print(f"Found {len(accounts['accounts'])} accounts")

        # Example 3: Get recent transactions
        print("\n3. Getting recent transactions...")
        from datetime import datetime, timedelta
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        transactions = plaid_ai_service.get_transactions(access_token, start_date, end_date)
        print(f"Found {transactions['total_transactions']} transactions")

        # Example 4: AI-powered spending analysis
        print("\n4. Analyzing spending patterns with AI...")
        analysis = plaid_ai_service.analyze_spending_patterns(access_token, days=30)
        print("AI Analysis completed:")
        print(f"- Analyzed {analysis['transaction_count']} transactions")
        print(f"- Period: {analysis['analysis_period']}")
        print(f"- AI Insights: {analysis['ai_insights'][:200]}...")

        # Example 5: Get financial advice
        print("\n5. Getting financial advice...")
        advice = plaid_ai_service.get_financial_advice(
            "How can I reduce my monthly spending?",
            access_token
        )
        print(f"Financial advice: {advice['advice'][:200]}...")

        # Example 6: Goal management
        print("\n6. Goal management...")

        # Create a goal
        goal = plaid_ai_service.create_goal("Save $1000 for emergency fund")
        print(f"Created goal: {goal}")

        # Get all goals
        all_goals = plaid_ai_service.get_all_goals()
        print(f"All goals: {all_goals}")

        # Analyze goal progress
        if all_goals['goals']:
            goal_analysis = plaid_ai_service.analyze_goals_progress(access_token)
            print(f"Goal progress analysis: {goal_analysis['progress_analysis'][:200]}...")

    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    main()