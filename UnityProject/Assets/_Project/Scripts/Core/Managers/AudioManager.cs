using UnityEngine;

namespace FutureGadgetAdventure.Core.Managers
{
    /// <summary>
    /// Audio management system
    /// Handles music, SFX, and voice playback
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        [Header("Audio Sources")]
        [SerializeField] private AudioSource musicSource;
        [SerializeField] private AudioSource sfxSource;
        [SerializeField] private AudioSource voiceSource;
        
        [Header("Volume")]
        [SerializeField] private float masterVolume = 1f;
        [SerializeField] private float musicVolume = 0.8f;
        [SerializeField] private float sfxVolume = 1f;
        [SerializeField] private float voiceVolume = 1f;
        
        private void Awake()
        {
            // Create audio sources if not assigned
            if (musicSource == null)
            {
                GameObject musicObj = new GameObject("MusicSource");
                musicObj.transform.SetParent(transform);
                musicSource = musicObj.AddComponent<AudioSource>();
                musicSource.loop = true;
                musicSource.playOnAwake = false;
            }
            
            if (sfxSource == null)
            {
                GameObject sfxObj = new GameObject("SFXSource");
                sfxObj.transform.SetParent(transform);
                sfxSource = sfxObj.AddComponent<AudioSource>();
                sfxSource.playOnAwake = false;
            }
            
            if (voiceSource == null)
            {
                GameObject voiceObj = new GameObject("VoiceSource");
                voiceObj.transform.SetParent(transform);
                voiceSource = voiceObj.AddComponent<AudioSource>();
                voiceSource.playOnAwake = false;
            }
            
            ApplyVolumes();
        }
        
        /// <summary>
        /// Play background music
        /// </summary>
        public void PlayMusic(AudioClip clip, bool loop = true)
        {
            if (musicSource == null || clip == null) return;
            
            musicSource.clip = clip;
            musicSource.loop = loop;
            musicSource.Play();
        }
        
        /// <summary>
        /// Play sound effect
        /// </summary>
        public void PlaySFX(AudioClip clip, float volumeScale = 1f)
        {
            if (sfxSource == null || clip == null) return;
            
            sfxSource.PlayOneShot(clip, volumeScale);
        }
        
        /// <summary>
        /// Play voice clip
        /// </summary>
        public void PlayVoice(AudioClip clip)
        {
            if (voiceSource == null || clip == null) return;
            
            voiceSource.clip = clip;
            voiceSource.Play();
        }
        
        /// <summary>
        /// Set master volume
        /// </summary>
        public void SetMasterVolume(float volume)
        {
            masterVolume = Mathf.Clamp01(volume);
            ApplyVolumes();
        }
        
        /// <summary>
        /// Set music volume
        /// </summary>
        public void SetMusicVolume(float volume)
        {
            musicVolume = Mathf.Clamp01(volume);
            ApplyVolumes();
        }
        
        /// <summary>
        /// Set SFX volume
        /// </summary>
        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
            ApplyVolumes();
        }
        
        /// <summary>
        /// Set voice volume
        /// </summary>
        public void SetVoiceVolume(float volume)
        {
            voiceVolume = Mathf.Clamp01(volume);
            ApplyVolumes();
        }
        
        private void ApplyVolumes()
        {
            if (musicSource != null)
            {
                musicSource.volume = masterVolume * musicVolume;
            }
            
            if (sfxSource != null)
            {
                sfxSource.volume = masterVolume * sfxVolume;
            }
            
            if (voiceSource != null)
            {
                voiceSource.volume = masterVolume * voiceVolume;
            }
        }
        
        public void Initialize()
        {
            Debug.Log("[AudioManager] Initialized");
        }
    }
}
