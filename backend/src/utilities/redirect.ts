import { html } from "hono/html";

export const redirectPage = () => html`
<html>
  <head>
    <style>
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        text-align: center;
        font-family: Arial, sans-serif;
      }
      img {
        width: 200px;
        height: auto;
        margin-bottom: 30px; /* Added padding between image and text */
      }
      .description {
        margin-bottom: 30px;
        font-size: 18px;
      }
      .button-container {
        display: flex;
        gap: 20px;
        margin-top: 20px;
      }
      .button {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 25px; /* Rounded buttons */
        padding: 12px 24px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      .button:hover {
        background-color: #357abD;
      }
      .button.secondary {
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
      }
      .button.secondary:hover {
        background-color: #e5e5e5;
      }
    </style>
  </head>
  <body>
    <img src="/logo.svg" alt="dearly logo" />
    <div class="description">
      Dearly is a private family sharing app.
    </div>
    <div class="button-container">
      <button class="button">Sign up for Early Access to the App</button>
      <button class="button secondary">Learn More</button>
    </div>
  </body>
</html>
`;
