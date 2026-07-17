Feature: Notes Are Isolated Per User

  Scenario: A user's note list does not include another user's notes
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "My Private Note" with body "Only mine" and tags "private" exists
    And I am authenticated as a different user
    When I list notes
    Then the response status code should be 200
    And the response JSON "data" should not contain a note titled "My Private Note"

  Scenario: A user cannot retrieve another user's note by id
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Secret plans" with body "Body" and tags "misc" exists
    And I am authenticated as a different user
    When I get the note
    Then the response status code should be 404

  Scenario: A user cannot update another user's note
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Original title" with body "Body" and tags "misc" exists
    And I am authenticated as a different user
    When I update the note with title "Hijacked"
    Then the response status code should be 404

  Scenario: A user cannot delete another user's note
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Do not delete me" with body "Body" and tags "misc" exists
    And I am authenticated as a different user
    When I delete the note
    Then the response status code should be 404
