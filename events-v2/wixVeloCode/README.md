# Using Backend Logic in Wix Automations ⚙️

Wix Automations includes built-in actions such as **Run Velo Code** and **Send HTTP request**, each with its own intended purpose and limitations.

- **Run Velo Code** is designed to trigger custom backend logic written in **Velo** (Wix’s JavaScript-based development environment). However, this action **does not return any value** to the automation flow—making it unusable when the result of the logic is needed in subsequent steps.

- **Send HTTP request** is primarily meant for **calling external APIs**, and it **does return a value**, which can then be used in later steps of the automation.

To work around the return-value limitation of **Run Velo Code**, I exposed my backend logic as a **public HTTP function** and used the **Send HTTP request** action to call it—even though the function lives within the same **Wix** site.

This is not the originally intended use of **Send HTTP request**, but it’s an effective and safe _workaround_ when you need to feed dynamic, backend-generated data into a Wix Automation.

## 📅 Wix Events - Event Form

When the event reaches capacity, the **Registration Form** is automatically replaced by a built-in **Waitlist Form** — which only collects `First Name`, `Last Name`, and `Email`.

**Submission of Phone Numbers**  
The foundation has its own way of determining who will be accepted from the waitlist members, and in some cases, the simplest way to reach out to these applicants is to make a phone call. That is why the phone number is requested from the waitlist participants.

## 📊 Wix Automation Scenarios

### CASE_1a: Run Velo Code (Initial Approach)

![Wix Automation with Run Velo Code Action (v1)](/events-v2/assets/wix-automation-run-velo-code-v1.png)

#### ✅ 1. Run Velo Code Action

For this step find the code logic here:  
[./wixAutomationCase1a/runVeloCodeAutomationAction.js](./wixAutomationCase1a/runVeloCodeAutomationAction.js)

#### ✅ 2. Wix Backend Code

For this step find the code logic here:  
[./wixAutomationCase1a/runVeloCodeBackend.web.js](./wixAutomationCase1a/runVeloCodeBackend.web.js)

**PROS** 👍

- It is the **suggested use** of the `Run Velo Code` action within **Wix Automation**.
- It would send a **Triggered Email** from the backend to those who are missing a phone number within **Wix Contacts**.

**CONS** 👎

- To send a **Triggered Email**, the contact should already be **Subscribed to marketing emails**, which is not guaranteed.
- Those who _do_ have a phone number would still need to be gathered into a Wix CMS table, and **additional n8n logic** would be required to retrieve that data and place it inside a Google Sheets table.

---

### CASE_1b: Run Velo Code (with Email Workaround)

Still using the `Run Velo Code` action element within **Wix Automation**, but to bypass the **'Subscribe to marketing emails'** requirement of **Triggered Emails**, a workaround was devised: adding a label to a contact, and then filtering that contact based on that label within the **Wix Automation** to send an email directly from the automation.

![Wix Automation with Run Velo Code Action (v2)](/events-v2/assets/wix-automation-run-velo-code-v2.png)

#### ✅ 1. Run Velo Code Action

For this step find the code logic here:  
[./wixAutomationCase1b/runVeloCodevAutomationAction.js](./wixAutomationCase1b/runVeloCodeAutomationAction.js)

#### ✅ 2. Wix Backend Code

For this step find the code logic here:  
[./wixAutomationCase1b/runVeloCodeBackend.web.js](./wixAutomationCase1b/runVeloCodeBackend.web.js)

**PROS** 👍

- It is the **suggested use** of the `Run Velo Code` action within **Wix Automation**.
- It **bypasses the 'Subscribe to marketing emails' requirement** for Triggered Emails by allowing emails to be sent directly from the Wix Automation.

**CONS** 👎

- More code is needed to be written.
- Those who _do_ have a phone number would **still need to be gathered** inside a Wix CMS table, and again, additional n8n logic would be required to retrieve that data and place it inside a Google Sheets table.

---

### CASE_2: Send HTTP request (A Smart Workaround)

This approach leverages the `Send HTTP request` action to overcome the limitations of `Run Velo Code`, allowing backend logic to return values to the automation flow.

![Wix Automation with Send HTTP request Action](/events-v2/assets/wix-automation-send-http-request.png)

#### ✅ 1. Send HTTP request

Set up this action element within Wix Automation.

![Wix Automation with Send HTTP request Action - Configuration](/events-v2/assets/wix-automation-send-http-request-configuration.png)

**Purpose**:
This action is designed to send data to an external system using an HTTP POST request. In this specific case, it's sending data to a **custom HTTP function exposed on the same Wix site's backend**.

**Configuration Details**:

- **Method**: It is configured to use the `POST` HTTP method.
- **Webhook URL**: In this special case, the endpoint defined within `http-functions.js` is called. For example: `https://yourdomain.com/_functions/findRsvpContactById`
- **Body params**: The request includes a Custom payload in its body:
  - `userId`: This parameter is populated dynamically with the user ID from the **Guest registers to waitlist** trigger.
  - `secretKey`: This parameter has a hardcoded value, a **generated random value**. This secret token is used for authentication with the function inside the `http-functions.js` file on the backend.
- **Response data**: The automation expects a JSON response, for example:
  ```JSON
  {
      "message": "Example message",
      "phone": "+36201234567"
  }
  ```

📝 **NOTES**

- **Why the `secretKey` is Hard-Coded**:
  In the Send HTTP request action of Wix Automations, the `secretKey` is hard-coded because the interface doesn't support dynamically generating a JSON Web Token (JWT) or any secure token on the fly. The request body is limited to predefined input fields, which makes runtime signing or encryption impossible within the automation itself.

- **How `secretKey` Protects Wix Backend HTTP Functions**:  
  When you expose an HTTP function in your Wix Backend using `http-functions.js`, it becomes publicly accessible. Without protection, anyone with the endpoint URL could potentially invoke the function—risking unauthorized access, data manipulation, or misuse of backend logic.

  To mitigate this, a `secretKey` is used as a **_pre-shared_key_** or a **_simple API key_**. The Wix Automation includes this key in the request body when calling the backend HTTP function.

  On the backend side, your function should begin by checking whether the received `secretKey` matches the expected value. If it doesn't, the function should immediately return an error response to reject the request. This provides basic access control for sensitive operations.

➕ Need a random `secretKey`? Use [random.org/strings](https://www.random.org/strings/) to generate one.

#### ✅ 2. Wix Backend Code

For this step find the code logic here:  
[./wixAutomationCase2/post_findRsvpContactById.js](./wixAutomationCase2/post_findRsvpContactById.js)

📝 **NOTES**  
Important note on **Wix Secrets Manager**:

- **Storage Format:** Secrets in Wix are returned as a **JSON** object, for example: `{"value":"your-actual-secret-key"}`.
- **Code Retrieval:** The Velo code specifically accesses the `.value` property to extract the raw secret string for comparison.

**PROS** 👍

- This workaround allows **dynamic values to be returned** from Velo backend code to the Wix Automation flow, which is not possible with `Run Velo Code`.
- Those who have a phone number **can be directly added to the Google Sheets table** using the returned data, simplifying the overall workflow.

**CONS** 👎

- More backend code is needed to implement the HTTP function and its authorization.
- The `secretKey` is hard-coded, which is a **less secure** approach compared to dynamically generated JWTs (as explored in Part 3 of the series).

## ⚠️ A Note on Code Examples and Debugging

You may notice that the code examples—both in Wix Automations and the backend HTTP functions—include numerous `console.log` statements.

This is intentional, and crucial during development and debugging. Wix's Velo environment, while powerful, can sometimes behave in unexpected ways, especially when integrating with other parts of the Wix ecosystem like Automations and Events.

- **Why the Logs are Here:** The `console.log` statements serve as a breadcrumb trail. They allow us to trace the exact flow of execution, see the values of variables at different stages, and confirm that data is being passed and received as expected. Without them, it would be extremely difficult to diagnose issues, such as a missing secret key or an invalid user ID, from within the **Wix Site Monitoring** logs.

- **For Production Use:** While invaluable for a tutorial and for troubleshooting, a finished, production-ready version of this code might have fewer or more targeted logs to keep the monitoring output clean. For this guide, the logs are essential to help you understand the logic and debug your own implementations.

Once your automation is stable in production, you can safely remove or reduce logging to keep your logs clean and focused.
