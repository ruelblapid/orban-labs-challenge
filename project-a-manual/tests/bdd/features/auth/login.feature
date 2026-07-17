Feature: User Login and Token Retrieval

  Scenario: A registered user logs in with valid credentials and receives an access token
    Given the FastAPI test client is available
    And a registered user with email "login.user@example.com" and password "Sup3rSecret!"
    When I log in with email "login.user@example.com" and password "Sup3rSecret!"
    Then the response status code should be 200
    And the response JSON "data" should contain "access_token"
    And the response JSON "data" should contain "token_type" as "bearer"
    And the response JSON "data" should contain "expires_in"
