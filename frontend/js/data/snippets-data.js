/** Snippet registry keyed by language mode */
export const snippets = {
    web: [
        {
            label: 'HTML Boilerplate',
            description: 'Full DOCTYPE HTML5 template',
            code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>`
        },
        {
            label: 'Flexbox Center',
            description: 'CSS flexbox centering snippet',
            code: `.container {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}`
        },
        {
            label: 'CSS Grid Layout',
            description: '3-column responsive grid',
            code: `.grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 1rem;\n}`
        },
        {
            label: 'Fetch API',
            description: 'Basic fetch with async/await',
            code: `async function fetchData(url) {\n    try {\n        const res = await fetch(url);\n        const data = await res.json();\n        return data;\n    } catch (err) {\n        console.error(err);\n    }\n}`
        },
        {
            label: 'Event Listener',
            description: 'DOM click event listener',
            code: `document.getElementById('btn').addEventListener('click', (e) => {\n    e.preventDefault();\n    console.log('Clicked!');\n});`
        },
    ],
    python: [
        {
            label: 'Hello World',
            description: 'Basic print statement',
            code: `print("Hello, World!")`
        },
        {
            label: 'For Loop',
            description: 'Range-based for loop',
            code: `for i in range(10):\n    print(i)`
        },
        {
            label: 'List Comprehension',
            description: 'Pythonic list filtering',
            code: `squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)`
        },
        {
            label: 'Function Definition',
            description: 'Function with type hints',
            code: `def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("World"))`
        },
        {
            label: 'Try / Except',
            description: 'Exception handling block',
            code: `try:\n    result = int(input("Enter a number: "))\n    print(f"You entered: {result}")\nexcept ValueError:\n    print("That was not a valid number.")`
        },
        {
            label: 'Class Template',
            description: 'Basic Python class',
            code: `class Animal:\n    def __init__(self, name: str):\n        self.name = name\n\n    def speak(self) -> str:\n        return f"{self.name} makes a sound"\n\ndog = Animal("Rex")\nprint(dog.speak())`
        },
    ]
};
