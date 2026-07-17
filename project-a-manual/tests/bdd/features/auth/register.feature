Feature: User Registration

  Scenario: A new user registers with a valid email and password
    Given the FastAPI test client is available
    When I register with email "new.user@example.com" and password "Sup3rSecret!"
    Then the response status code should be 201
    And the response JSON should contain "success" as "true"
    And the response JSON should contain "data"
    And the response JSON "data" should contain "email" as "new.user@example.com"
