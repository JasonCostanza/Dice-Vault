const sum = require("../scripts/sum");

test("adds 1 + 2 to equal 3", () => {
    // Arrange
    let valueA = 1;
    let valueB = 2;
    let result;

    // Act
    result = sum(valueA, valueB);

    // Assert
    expect(result).toBe(3);
});
