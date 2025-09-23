"""
Display all Azure OpenAI prompts used in the PlaidAIService

This file shows all the prompts that will be sent to Azure OpenAI
so you can review and modify them as needed.
"""

def print_all_prompts():
    print("=" * 80)
    print("AZURE OPENAI PROMPTS USED IN PLAID AI SERVICE")
    print("=" * 80)

    print("\n" + "="*50)
    print("1. ANALYZE SPENDING PATTERNS PROMPT")
    print("="*50)

    print("\nSYSTEM MESSAGE:")
    system_msg_1 = "You are a financial advisor AI that analyzes spending patterns and provides actionable insights."
    print(f'"{system_msg_1}"')

    print("\nUSER MESSAGE TEMPLATE:")
    user_prompt_1 = """
Analyze the following {transaction_count} financial transactions from the past {days} days:

{transaction_data_json}

Please provide:
1. Top spending categories and amounts
2. Unusual or concerning spending patterns
3. Opportunities for savings
4. Overall financial health insights
5. Specific actionable recommendations

Format your response as structured JSON with clear sections.
"""
    print(f'"""{user_prompt_1}"""')

    print("\nEXAMPLE WITH SAMPLE DATA:")
    sample_transactions = [
        {'amount': 15.99, 'category': 'Food and Drink', 'name': 'Starbucks', 'date': '2024-01-15'},
        {'amount': 89.50, 'category': 'Shops', 'name': 'Amazon', 'date': '2024-01-14'},
        {'amount': 45.00, 'category': 'Food and Drink', 'name': 'Restaurant XYZ', 'date': '2024-01-13'}
    ]

    example_prompt_1 = f"""
Analyze the following 3 financial transactions from the past 30 days:

{sample_transactions}

Please provide:
1. Top spending categories and amounts
2. Unusual or concerning spending patterns
3. Opportunities for savings
4. Overall financial health insights
5. Specific actionable recommendations

Format your response as structured JSON with clear sections.
"""
    print(f'"""{example_prompt_1}"""')

    print("\n" + "="*50)
    print("2. GET FINANCIAL ADVICE PROMPT")
    print("="*50)

    print("\nSYSTEM MESSAGE:")
    system_msg_2 = "You are a helpful financial advisor AI. Provide clear, actionable financial advice while being mindful that you're not a licensed financial advisor."
    print(f'"{system_msg_2}"')

    print("\nUSER MESSAGE TEMPLATE (with financial context):")
    user_prompt_2_with_context = """
User's Financial Context:
- Number of accounts: {account_count}
- Recent transactions (last 7 days): {recent_transaction_count}

User Question: {user_question}

Please provide helpful, personalized financial advice based on the question and available context.
Be specific, actionable, and educational in your response.
"""
    print(f'"""{user_prompt_2_with_context}"""')

    print("\nUSER MESSAGE TEMPLATE (without financial context):")
    user_prompt_2_no_context = """
No recent financial data available.

User Question: {user_question}

Please provide helpful, personalized financial advice based on the question and available context.
Be specific, actionable, and educational in your response.
"""
    print(f'"""{user_prompt_2_no_context}"""')

    print("\nEXAMPLE WITH SAMPLE QUESTION:")
    example_prompt_2 = """
User's Financial Context:
- Number of accounts: 3
- Recent transactions (last 7 days): 12

User Question: How can I reduce my monthly spending?

Please provide helpful, personalized financial advice based on the question and available context.
Be specific, actionable, and educational in your response.
"""
    print(f'"""{example_prompt_2}"""')

    print("\n" + "="*50)
    print("3. ANALYZE GOALS PROGRESS PROMPT")
    print("="*50)

    print("\nSYSTEM MESSAGE:")
    system_msg_3 = "You are a financial advisor AI specializing in goal-based financial planning."
    print(f'"{system_msg_3}"')

    print("\nUSER MESSAGE TEMPLATE:")
    user_prompt_3 = """
Analyze progress towards these financial goals based on recent transaction data:

Goals:
{goals_list_json}

Recent Transactions (last 30 days):
{recent_transactions_json}

Please provide:
1. Progress assessment for each goal
2. Specific recommendations to achieve goals faster
3. Potential obstacles or concerns
4. Suggested adjustments to spending habits

Format as structured JSON.
"""
    print(f'"""{user_prompt_3}"""')

    print("\nEXAMPLE WITH SAMPLE DATA:")
    sample_goals = ["Save $1000 for emergency fund", "Pay off credit card debt", "Save for vacation"]
    sample_recent_transactions = [
        {'amount': 500.00, 'category': 'Transfer', 'name': 'Savings Account Transfer'},
        {'amount': 25.99, 'category': 'Food and Drink', 'name': 'Fast Food'},
        {'amount': 200.00, 'category': 'Payment', 'name': 'Credit Card Payment'}
    ]

    example_prompt_3 = f"""
Analyze progress towards these financial goals based on recent transaction data:

Goals:
{sample_goals}

Recent Transactions (last 30 days):
{sample_recent_transactions}

Please provide:
1. Progress assessment for each goal
2. Specific recommendations to achieve goals faster
3. Potential obstacles or concerns
4. Suggested adjustments to spending habits

Format as structured JSON.
"""
    print(f'"""{example_prompt_3}"""')

    print("\n" + "="*80)
    print("PROMPT CONFIGURATION SETTINGS")
    print("="*80)

    print("\nTEMPERATURE SETTINGS:")
    print("- analyze_spending_patterns(): temperature=0.3 (more focused/consistent)")
    print("- get_financial_advice(): temperature=0.4 (slightly more creative)")
    print("- analyze_goals_progress(): temperature=0.3 (more focused/consistent)")

    print("\nMODEL USED:")
    print("- All prompts use the deployment specified in DEPLOYMENT_NAME env var (default: 'gpt-4.1')")

    print("\n" + "="*80)
    print("CUSTOMIZATION NOTES")
    print("="*80)

    print("""
To customize these prompts:

1. Edit the prompts in services/plaid_ai_service.py
2. Modify the system messages to change the AI's role/personality
3. Adjust temperature values for different creativity levels
4. Add/remove specific instructions in the user prompts
5. Change the output format requirements (JSON, text, etc.)

Key locations in the code:
- analyze_spending_patterns(): Lines ~200-230
- get_financial_advice(): Lines ~270-300
- analyze_goals_progress(): Lines ~420-450
""")

if __name__ == "__main__":
    print_all_prompts()