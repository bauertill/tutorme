# Lesson 3: Loops and Repeating Actions

## Step 0: Introduction

Well done on completing the second lesson! 🎉 Now you know how to make decisions with **if statements**. Today, we’re going to learn about **loops**.

Loops let you repeat actions in your program. For example, if you want to say "Hello" five times, instead of writing `console.log("Hello");` five times, you can use a **loop** to do it automatically!

Ready? Let’s dive in!

---

## Step 1: Introduce new concept - Loops

A **loop** repeats a block of code as many times as you want. In JavaScript, one of the most common loops is the **for loop**.

Here’s how it works:

```javascript
for (let i = 0; i < 5; i++) {
  console.log("This is loop number " + i);
}
```

What’s happening here:

1. `let i = 0` starts the loop. We’re creating a variable `i` and setting it to `0`. This variable keeps track of the loop count.
2. `i < 5` is the condition. The loop will keep running as long as `i` is less than `5`.
3. `i++` increases `i` by 1 each time the loop runs.
4. The code inside the curly braces `{}` runs every time the loop repeats.

The computer will show:

```
This is loop number 0
This is loop number 1
This is loop number 2
This is loop number 3
This is loop number 4
```

---

## Step 2: Give an example of the concept

Here’s another example:

```javascript
for (let count = 1; count <= 3; count++) {
  console.log("I am learning loops! This is time number " + count);
}
```

What this does:

1. It starts with `count = 1`.
2. The loop runs as long as `count <= 3`.
3. Each time, it adds 1 to `count` and shows a message.

The computer will show:

```
I am learning loops! This is time number 1
I am learning loops! This is time number 2
I am learning loops! This is time number 3
```

---

## Step 3: Give an exercise to practice the concept

Your turn! 🚀

1. Write a **for loop** that counts from 1 to 5.
2. Inside the loop, use `console.log()` to show this message: `"The number is <number>"`.

Here’s the starting code:

```javascript
// Your code here
for (let i = ___; i <= ___; i++) {
  console.log("The number is " + i);
}
```

---

## Step 4: Bonus Concept - Nested Loops

You can put one loop inside another loop. This is called a **nested loop**.

Example:

```javascript
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 2; j++) {
    console.log("Outer loop: " + i + ", Inner loop: " + j);
  }
}
```

What’s happening:

- The outer loop (`i`) runs 3 times.
- For each time the outer loop runs, the inner loop (`j`) runs 2 times.

The computer will show:

```
Outer loop: 1, Inner loop: 1
Outer loop: 1, Inner loop: 2
Outer loop: 2, Inner loop: 1
Outer loop: 2, Inner loop: 2
Outer loop: 3, Inner loop: 1
Outer loop: 3, Inner loop: 2
```

---

## Step 5: Practice Nested Loops

Try this challenge:

1. Write a **nested loop**:
   - The outer loop should count from 1 to 3.
   - The inner loop should count from 1 to 2.
2. Inside the inner loop, use `console.log()` to show:  
   `"Outer: <outer number>, Inner: <inner number>"`.

Here’s the starting code:

```javascript
// Your code here
for (let outer = ___; outer <= ___; outer++) {
  for (let inner = ___; inner <= ___; inner++) {
    console.log("Outer: " + outer + ", Inner: " + inner);
  }
}
```

---

Congratulations on finishing Lesson 3! 🎉 You’ve learned how to repeat actions with **loops**. In the next lesson, we’ll learn how to store and organize multiple pieces of data using **arrays**!
