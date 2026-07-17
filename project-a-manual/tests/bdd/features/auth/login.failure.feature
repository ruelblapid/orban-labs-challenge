Feature: User Login Failure

  Scenario: A user provides the wrong password and is denied access
    Given the FastAPI test client is available
    And a registered user with email "login.failure.user@example.com" and password "Sup3rSecret!"
    When I log in with email "login.failure.user@example.com" and password "WrongPassword!"
    Then the response status code should be 401
    And the response JSON should contain "success" as "false"
    And the response JSON "error" should contain "message" as "Invalid email or password"
