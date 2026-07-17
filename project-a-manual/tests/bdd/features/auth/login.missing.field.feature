Feature: User Login Missing Field Failure

  Scenario: A user submits a login request without a password
    Given the FastAPI test client is available
    When I log in with email "someone@example.com" and no password
    Then the response status code should be 422
    And the response JSON should contain "success" as "false"
    And the response JSON "error" should contain "code" as "UNPROCESSABLE_ENTITY"
