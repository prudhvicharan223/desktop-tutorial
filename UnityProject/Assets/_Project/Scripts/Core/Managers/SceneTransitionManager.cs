using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;

namespace FutureGadgetAdventure.Core.Managers
{
    /// <summary>
    /// Handles scene transitions with loading screens
    /// Provides smooth transitions between game scenes
    /// </summary>
    public class SceneTransitionManager : MonoBehaviour
    {
        [Header("Loading Screen")]
        [SerializeField] private GameObject loadingScreen;
        [SerializeField] private UnityEngine.UI.Slider progressBar;
        [SerializeField] private UnityEngine.UI.Text loadingText;
        [SerializeField] private float minimumLoadTime = 1f;
        
        [Header("Fade")]
        [SerializeField] private CanvasGroup fadeCanvasGroup;
        [SerializeField] private float fadeDuration = 0.5f;
        
        private bool isLoading = false;
        
        /// <summary>
        /// Load a scene asynchronously
        /// </summary>
        public void LoadScene(string sceneName)
        {
            if (!isLoading)
            {
                StartCoroutine(LoadSceneAsync(sceneName));
            }
        }
        
        /// <summary>
        /// Load scene by index
        /// </summary>
        public void LoadScene(int sceneIndex)
        {
            if (!isLoading)
            {
                StartCoroutine(LoadSceneAsync(sceneIndex));
            }
        }
        
        /// <summary>
        /// Reload current scene
        /// </summary>
        public void ReloadCurrentScene()
        {
            LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
        
        private IEnumerator LoadSceneAsync(string sceneName)
        {
            isLoading = true;
            
            // Show loading screen
            if (loadingScreen != null)
            {
                loadingScreen.SetActive(true);
            }
            
            yield return StartCoroutine(FadeIn());
            
            float startTime = Time.time;
            
            // Start loading
            AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName);
            operation.allowSceneActivation = false;
            
            while (!operation.isDone)
            {
                // Calculate progress
                float progress = Mathf.Clamp01(operation.progress / 0.9f);
                
                // Update UI
                if (progressBar != null)
                {
                    progressBar.value = progress;
                }
                
                if (loadingText != null)
                {
                    loadingText.text = $"Loading... {Mathf.RoundToInt(progress * 100)}%";
                }
                
                // Scene is ready, wait for minimum load time
                if (operation.progress >= 0.9f)
                {
                    float elapsedTime = Time.time - startTime;
                    if (elapsedTime >= minimumLoadTime)
                    {
                        operation.allowSceneActivation = true;
                    }
                }
                
                yield return null;
            }
            
            yield return StartCoroutine(FadeOut());
            
            // Hide loading screen
            if (loadingScreen != null)
            {
                loadingScreen.SetActive(false);
            }
            
            isLoading = false;
        }
        
        private IEnumerator LoadSceneAsync(int sceneIndex)
        {
            return LoadSceneAsync(SceneManager.GetSceneByBuildIndex(sceneIndex).name);
        }
        
        private IEnumerator FadeIn()
        {
            if (fadeCanvasGroup == null) yield break;
            
            float elapsed = 0f;
            while (elapsed < fadeDuration)
            {
                elapsed += Time.deltaTime;
                fadeCanvasGroup.alpha = Mathf.Lerp(0, 1, elapsed / fadeDuration);
                yield return null;
            }
            
            fadeCanvasGroup.alpha = 1;
        }
        
        private IEnumerator FadeOut()
        {
            if (fadeCanvasGroup == null) yield break;
            
            float elapsed = 0f;
            while (elapsed < fadeDuration)
            {
                elapsed += Time.deltaTime;
                fadeCanvasGroup.alpha = Mathf.Lerp(1, 0, elapsed / fadeDuration);
                yield return null;
            }
            
            fadeCanvasGroup.alpha = 0;
        }
        
        public void Initialize()
        {
            if (loadingScreen != null)
            {
                loadingScreen.SetActive(false);
            }
            
            Debug.Log("[SceneTransitionManager] Initialized");
        }
    }
}
