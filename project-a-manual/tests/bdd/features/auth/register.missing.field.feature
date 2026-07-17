Feature: User Registration Missing Field Failure

  Scenario: A user submits a registration request without a password
    Given the FastAPI test client is available
    When I register with email "missing.field.user@example.com" and no password
    Then the response status code should be 422
    And the response JSON should contain "success" as "false"
    And the response JSON "error" should contain "code" as "UNPROCESSABLE_ENTITY"
