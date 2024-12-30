# Code Review Guide

When reviewing a PR, we should focus on providing constructive feedback and asking questions for clarifications or suggestions. Here are key areas to consider, but not limited to:
1. **Correctness**:
   * **Does it solve the problem?**: Ensure the PR addresses the feature request described in the ticket.
   * **Edge Cases**: Does the code implementation account for unexpected conditions?
   * **Test**: Verify that appropriate tests are included, and that edge cases are covered. Test this manually for frontend.
2. **Code Quality**:
   * **Readability**: Is the code clear and understandable (with methods that are focused and functions that have meaningful, descriptive names)?
   * **Documentation**: Are there documentation and comments for complex logic?
   * **Modularity**: Does the PR promote well-defined components that are easy to reuse, extend, or substitute without affecting other parts of the system?

