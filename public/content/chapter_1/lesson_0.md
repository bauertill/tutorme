# Lesson 0: Introduction to Variables and Basic Programming

## Step 0: Introduction

Welcome to your first programming lesson! 🎉 Today, we’re going to learn about **variables**, how to do some **basic math**, and how to make the computer show messages using `console.log()` and `alert()`.

A **variable** is like a box where we can store something, like a number or a word. We’ll also learn how to tell the computer to add, subtract, multiply, or divide numbers for us. Ready? Let’s start!

---

## Step 1: Introduce new concept 1 - Variables

A **variable** is like a nickname for something. You can store a number or a piece of text (words) in a variable and use it later.

Here’s how you create a variable in JavaScript:

```javascript
let name = "Alex";
let age = 10;
```

- `let` means we’re creating a new variable.
- `name` and `age` are the variable names (the nicknames).
- `"Alex"` and `10` are the values we put in the variables.

Think of `name` as a box labeled "name" and inside it, we put the word `"Alex"`. The same goes for `age`, which has the number `10`.

---

## Step 2: Give an example of the concept

Here’s an example of variables in action:

```javascript
let favoriteColor = "blue";
let numberOfApples = 5;

console.log("My favorite color is " + favoriteColor);
console.log("I have " + numberOfApples + " apples.");
```

What this does:

- It stores the word `"blue"` in the variable `favoriteColor`.
- It stores the number `5` in `numberOfApples`.
- The `console.log()` command tells the computer to display the message inside the parentheses.

When you run this, the computer will show:

```
My favorite color is blue
I have 5 apples.
```

---

## Step 3: Give an exercise to practice the concept

Now it’s your turn! 🚀

1. Create two variables: `yourName` and `yourAge`.
2. Set `yourName` to your name and `yourAge` to your age.
3. Use `console.log()` to show this message:
   ```
   Hello, my name is <your name> and I am <your age> years old.
   ```

Example:

```javascript
// Your code here
let yourName = "___"; // Fill in your name
let yourAge = ___; // Fill in your age

console.log("Hello, my name is " + yourName + " and I am " + yourAge + " years old.");
```

---

## Step 4: Bonus Concept - Basic Math

You can also use variables to do math. For example:

```javascript
let x = 10;
let y = 5;

let sum = x + y; // Adding
let difference = x - y; // Subtracting

console.log("The sum is " + sum);
console.log("The difference is " + difference);
```

The computer will show:

```
The sum is 15
The difference is 5
```

---

## Step 5: Practice Basic Math

Try this challenge:

1. Create two variables: `a` and `b`. Set them to any numbers you like.
2. Calculate:
   - Their sum (`a + b`)
   - Their product (`a * b`)
3. Use `console.log()` to show the results.
