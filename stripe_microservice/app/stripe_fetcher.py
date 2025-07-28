import stripe
import json
import os
from dotenv import load_dotenv
from datetime import datetime

def get_paid_sessions():
    # Load environment variables from .env file
    load_dotenv()

    # Set Stripe API key from environment
    stripe.api_key = os.environ.get("STRIPE_LIVE_SECRET_KEY")

    # Collect payment link IDs from environment variables
    payment_link_ids = [
        os.environ.get("PLINK_CATEGORY_ONE"),
        os.environ.get("PLINK_CATEGORY_TWO"),
        os.environ.get("PLINK_CATEGORY_THREE"),
    ]

    # Load timestamp of the last run to avoid duplicating already-fetched sessions
    last_run_file = "app/stripe_exports/last_run.json"
    if os.path.exists(last_run_file):
        with open(last_run_file, "r") as f:
            last_run_timestamp = json.load(f).get("last_run", 0)
    else:
        last_run_timestamp = 0

    # This list will store all new paid sessions
    all_paid_sessions = []

    # Iterate through each payment link ID
    for link_id in payment_link_ids:
        if not link_id:
            continue  # Skip if the link ID is missing

        has_more = True
        starting_after = None  # For pagination

        # Fetch sessions for the payment link, handling pagination
        # https://docs.stripe.com/api/checkout/sessions/list
        while has_more:
            response = stripe.checkout.Session.list(
                limit=100,
                payment_link=link_id,
                starting_after=starting_after
            )
            sessions = response.data

            # Filter sessions: only include paid sessions created after last run
            for session in sessions:
                if session.payment_status == "paid" and session.created > last_run_timestamp:
                    paid_info = {
                        "payment_link_id": session.payment_link,
                        "amount_total": session.amount_total / 100,  # Convert cents to currency units
                        "currency": session.currency.upper(),
                        "customer_email": session.customer_details.email if session.customer_details else None,
                        "name": session.customer_details.name if session.customer_details else None,
                        "created": datetime.fromtimestamp(session.created).strftime("%Y-%m-%d %H:%M")
                    }
                    all_paid_sessions.append(paid_info)

            # Handle pagination
            has_more = response.has_more
            if has_more:
                starting_after = sessions[-1].id

    # If new paid sessions were found, save them to a timestamped JSON file
    if all_paid_sessions:
        os.makedirs("app/stripe_exports", exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"paid_sessions_{timestamp}.json"
        output_path = os.path.join("app/stripe_exports", filename)

        with open(output_path, "w") as f:
            json.dump(all_paid_sessions, f, indent=2)

    # Update the last_run timestamp to now, whether new data was found or not
    os.makedirs("app/stripe_exports", exist_ok=True)
    now_unix = int(datetime.now().timestamp())
    with open(last_run_file, "w") as f:
        json.dump({"last_run": now_unix}, f)

    # Return result with session data (if any)
    return {
        "status": "success" if all_paid_sessions else "no_new_data",
        "data": all_paid_sessions
    }
