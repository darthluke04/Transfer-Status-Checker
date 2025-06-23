# Firebase Studio
:)
This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to GitHub Pages

This project is configured for easy deployment to GitHub Pages. Follow these steps:

1.  **Create a GitHub Repository**: Push this project's code to a new repository on GitHub.

2.  **Update Configuration**: Open `next.config.ts` and replace `'your-repo-name'` in the `basePath` property with the name of your GitHub repository.
    
    ```javascript
    // in next.config.ts
    const nextConfig = {
      // ...
      basePath: '/your-repo-name', // <-- CHANGE THIS
      // ...
    };
    ```

3.  **Enable GitHub Pages**: In your GitHub repository, go to `Settings` > `Pages`. Under "Build and deployment", select `GitHub Actions` as the source.

4.  **Push and Deploy**: Commit and push your changes to the `main` branch. The GitHub Action defined in `.github/workflows/deploy.yml` will automatically build and deploy your site. You can monitor the progress in the `Actions` tab of your repository.

Once the deployment is complete, your site will be live at `https://<your-username>.github.io/<your-repo-name>`.
