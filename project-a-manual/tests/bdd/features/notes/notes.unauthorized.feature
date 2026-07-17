Feature: Notes Require Authentication

  Scenario: An unauthenticated request to list notes is denied
    Given the FastAPI test client is available
    When I list notes without authentication
    Then the response status code should be 401
