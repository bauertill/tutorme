# Lesson 2: Using Variables and Conditional Statements

## Step 0: Introduction

Great job on completing the first lesson! 🎉 Now that you know about **variables** and basic math, it’s time to learn something new: **conditional statements**.

A **conditional statement** is how you make decisions in your program. For example, you can tell the computer:  
"If I’m older than 10, show a message. Otherwise, show something else."

We’ll also practice more with `console.log()` and math!

---

## Step 1: Introduce new concept - Conditional Statements

Conditional statements help your program decide what to do based on certain rules. In JavaScript, we use an **if statement** to make decisions.

Here’s an example:

```javascript
let age = 12;

if (age > 10) {
  console.log("You are older than 10!");
}
```

- `if (age > 10)` checks if the variable `age` is greater than 10.
- If the condition is true, the code inside the curly braces `{}` runs.

We can also add an **else** part for when the condition is not true:

```javascript
if (age > 10) {
  console.log("You are older than 10!");
} else {
  console.log("You are 10 or younger.");
}
```

---

## Step 2: Give an example of the concept

Here’s a complete example:

```javascript
let favoriteNumber = 7;

if (favoriteNumber > 5) {
  console.log("Your favorite number is big!");
} else {
  console.log("Your favorite number is small!");
}
```

If `favoriteNumber` is greater than 5, the computer will show:

```
Your favorite number is big!
```

But if `favoriteNumber` is 3, it will show:

```
Your favorite number is small!
```

---

## Step 3: Give an exercise to practice the concept

Now it’s your turn! 🚀

1. Create a variable called `myAge` and set it to your age.
2. Write an **if statement** that checks if your age is 13 or older:
   - If it is, show this message: `"You are a teenager!"`
   - Otherwise, show: `"You are still a kid!"`

Here’s the starting code:

```javascript
// Your code here
let myAge = ___; // Fill in your age

if (___) {
  // Fill in the condition
  console.log("You are a teenager!");
} else {
  console.log("You are still a kid!");
}
```

---

## Step 4: Bonus Concept - Combining Conditions

Sometimes you need to check more than one condition. You can combine them using **&&** (and) or **||** (or).

- `&&` means both conditions must be true.
- `||` means at least one condition must be true.

Example:

```javascript
let num = 8;

if (num > 5 && num < 10) {
  console.log("The number is between 5 and 10.");
} else {
  console.log("The number is not between 5 and 10.");
}
```

---

## Step 5: Practice Combining Conditions

Try this challenge:

1. Create a variable called `temperature` and set it to any number you like.
2. Write an **if statement** to check:
   - If the temperature is between 20 and 30, show: `"The weather is nice!"`
   - Otherwise, show: `"It’s too hot or too cold!"`

Here’s the starting code:

```javascript
// Your code here
let temperature = ___; // Fill in a number

if (___) {
  // Fill in the combined condition
  console.log("The weather is nice!");
} else {
  console.log("It’s too hot or too cold!");
}
```
