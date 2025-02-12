### Lesson 1: Introduction to Computer Programming with JavaScript

**Objective:**  
By the end of this lesson, the student will understand the basics of JavaScript programming, including variables, basic math operations, and how to display messages using `console.log()` and `alert()`.

---

### **Step 1: What is Programming? (5 minutes)**

**Explain:**  
Programming is how we talk to computers and tell them what to do. A program is a set of instructions that a computer follows to solve problems or complete tasks.

**Example:**  
Think of a recipe! It tells you step-by-step how to make something. Programming is like writing a recipe for the computer.

---

### **Step 2: Set Up (5 minutes)**

1. Open a browser (e.g., Chrome).
2. Open the Developer Tools by pressing `Ctrl + Shift + I` (Windows) or `Cmd + Option + I` (Mac).
3. Click on the **Console** tab—this is where we’ll write and run our JavaScript code.

---

### **Step 3: Variables and Basic Math (15 minutes)**

**What is a Variable?**

- A variable is like a container where we can store information.
- We give the container a name so we can use it later.

#### **Example 1: Storing and Displaying Information**

```javascript
// Create a variable to store a name
let name = "Alex";

// Display the name in the console
console.log("Hello, " + name + "!");

// Show an alert message
alert("Welcome to programming, " + name + "!");
```

**Try It:**

- Change the value of `name` to your own name.
- Run the code again.

#### **Example 2: Simple Math Operations**

```javascript
// Store two numbers
let num1 = 10;
let num2 = 20;

// Add the numbers and store the result
let sum = num1 + num2;

// Display the result
console.log("The sum of " + num1 + " and " + num2 + " is " + sum);
```

**Try It:**

- Change `num1` and `num2` to other numbers.
- Try subtraction (`-`), multiplication (`*`), or division (`/`).

---

### **Step 4: Conditional Statements (15 minutes)**

**What is a Conditional Statement?**

- A conditional statement checks if something is true and then decides what to do.

#### **Example 3: Guess the Number**

```javascript
// Store a secret number
let secretNumber = 7;

// Ask the user for a guess
let guess = prompt("Guess a number between 1 and 10:");

// Check if the guess is correct
if (guess == secretNumber) {
  alert("Congratulations! You guessed it right.");
} else {
  alert("Oops! The correct number was " + secretNumber);
}
```

**Try It:**

- Change `secretNumber` to a different number.
- Add another condition to check if the guess is too high or too low.

---

### **Step 5: Recap and Wrap-Up (10 minutes)**

1. **Recap:**

   - Variables store information.
   - We can do math with numbers using operators like `+`, `-`, `*`, and `/`.
   - Conditional statements let us make decisions in our programs.

2. **Ask Questions:**

   - What did you enjoy about programming?
   - What would you like to learn next?

3. **Homework (Optional):**
   - Write a program that asks for the user’s name and their favorite color. Then display a message like:  
     `"Hello [name], [color] is a great color!"`

---

**Congratulations! You've written your first JavaScript programs! 🎉**
