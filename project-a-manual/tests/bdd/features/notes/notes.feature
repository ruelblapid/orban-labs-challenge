Feature: Notes CRUD

  Scenario: An authenticated user creates a note
    Given the FastAPI test client is available
    And I am authenticated as a new user
    When I create a note titled "Groceries" with body "Buy milk and eggs" and tags "home,urgent"
    Then the response status code should be 201
    And the response JSON should contain "success" as "true"
    And the response JSON "data" should contain "title" as "Groceries"

  Scenario: An authenticated user lists notes
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Standup notes" with body "Discuss sprint goals" and tags "work" exists
    When I list notes
    Then the response status code should be 200
    And the response JSON "data" should contain a note titled "Standup notes"

  Scenario: An authenticated user retrieves a note by id
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Reading list" with body "Finish chapter 4" and tags "personal" exists
    When I get the note
    Then the response status code should be 200
    And the response JSON "data" should contain "title" as "Reading list"

  Scenario: An authenticated user updates a note
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Old title" with body "Body text" and tags "misc" exists
    When I update the note with title "New title"
    Then the response status code should be 200
    And the response JSON "data" should contain "title" as "New title"

  Scenario: An authenticated user deletes a note
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Temporary" with body "To be removed" and tags "misc" exists
    When I delete the note
    Then the response status code should be 204
    When I delete the note again
    Then the response status code should be 404
