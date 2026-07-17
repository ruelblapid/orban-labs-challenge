Feature: Notes Validation Failures

  Scenario: Creating a note with an empty title is rejected
    Given the FastAPI test client is available
    And I am authenticated as a new user
    When I create a note with an empty title
    Then the response status code should be 422

  Scenario: Retrieving a note that does not exist returns 404
    Given the FastAPI test client is available
    And I am authenticated as a new user
    When I get a note that does not exist
    Then the response status code should be 404
    And the response JSON should contain "success" as "false"
