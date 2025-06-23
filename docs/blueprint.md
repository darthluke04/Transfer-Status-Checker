# **App Name**: Folder File Finder

## Core Features:

- Folder Table Display: Display a table showing each folder type with its corresponding path, required file types, and status.
- Configuration Setup: Define folder types, file types, and their corresponding paths as configurations within the application.
- Folder Content Scanner: Implement logic to programmatically read the state of each folder from the file system. Read config from Configuration setup to figure out folder path, and filetypes to match on
- Filepath Validaiton Tool: Read the values of each text cell and determine if the local file path in the cell is valid, or return an error state.
- Folder Structure Upload: The user should be able to upload their structure / folders.
- Folder status: Dynamically display an icon reflecting a passing or failing status, depending on the presense of the filetypes described. Automatically refresh at certain time internal.

## Style Guidelines:

- Primary color: Light blue (#90CAF9) for a clean and professional look.
- Background color: Very light gray (#F5F5F5) for a subtle backdrop.
- Accent color: Indigo (#5C6BC0) to highlight important status indicators and interactive elements.
- Body and headline font: 'Inter' (sans-serif) for clear readability and a modern feel.
- Code font: 'Source Code Pro' (monospace) for displaying file paths, ensuring each character's legibility.
- Use simple, intuitive icons to represent file types (e.g., a video camera for MP4 files, an image icon for JPEG files).
- Design a table layout with clear columns for folder type, path, required file types, and status. Ensure the layout is responsive and readable on different screen sizes.