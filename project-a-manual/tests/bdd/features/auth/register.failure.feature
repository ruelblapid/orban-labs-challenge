Feature: User Registration Failure

  Scenario: A user tries to register with an email that is already taken
    Given the FastAPI test client is available
    And a registered user with email "duplicate.user@example.com" and password "Sup3rSecret!"
    When I register with email "duplicate.user@example.com" and password "AnotherPass1!"
    Then the response status code should be 409
    And the response JSON should contain "success" as "false"
    And the response JSON "error" should contain "message" as "Email is already registered"
