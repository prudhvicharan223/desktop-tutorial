using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace FutureGadgetAdventure.Gameplay.CompanionAI
{
    /// <summary>
    /// Manages companion's emotional states, animations, and reactions
    /// Provides dialogue hints and personality to the robot companion
    /// </summary>
    public class CompanionEmotion : MonoBehaviour
    {
        [Header("Animation")]
        [SerializeField] private Animator animator;
        [SerializeField] private float emotionDuration = 2f;
        
        [Header("Dialogue")]
        [SerializeField] private bool enableDialogue = true;
        [SerializeField] private float dialogueCooldown = 10f;
        
        [Header("Emotion Settings")]
        [SerializeField] private float emotionCooldown = 5f;
        [SerializeField] private bool allowRandomEmotions = true;
        [SerializeField] private float randomEmotionChance = 0.1f;
        
        [Header("Visual Effects")]
        [SerializeField] private ParticleSystem happyParticles;
        [SerializeField] private ParticleSystem sadParticles;
        [SerializeField] private ParticleSystem surprisedParticles;
        [SerializeField] private GameObject emotionBubble;
        
        [Header("Audio")]
        [SerializeField] private List<AudioClip> happySounds;
        [SerializeField] private List<AudioClip> sadSounds;
        [SerializeField] private List<AudioClip> surprisedSounds;
        [SerializeField] private List<AudioClip> thinkingSounds;
        
        // State tracking
        private EmotionType currentEmotion = EmotionType.Neutral;
        private float lastEmotionTime;
        private float lastDialogueTime;
        private AudioSource audioSource;
        private bool isPlayingEmotion;
        
        // Dialogue database
        private Dictionary<DialogueContext, List<string>> dialogueDatabase;
        
        private void Awake()
        {
            if (animator == null)
            {
                animator = GetComponentInChildren<Animator>();
            }
            
            audioSource = GetComponent<AudioSource>();
            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
            
            InitializeDialogueDatabase();
        }
        
        private void InitializeDialogueDatabase()
        {
            dialogueDatabase = new Dictionary<DialogueContext, List<string>>()
            {
                { DialogueContext.Greeting, new List<string>
                    {
                        "Hiro! Ready for an adventure?",
                        "Good to see you!",
                        "What gadget shall we use today?"
                    }
                },
                { DialogueContext.Idle, new List<string>
                    {
                        "The weather is nice today!",
                        "I wonder what everyone is up to...",
                        "Should we explore the town?",
                        "I'm here if you need any help!"
                    }
                },
                { DialogueContext.Hint, new List<string>
                    {
                        "Try using the Anywhere Door to travel faster!",
                        "The Bamboo Copter can help you reach high places.",
                        "Time Cloth can reset objects to their previous state.",
                        "Don't forget to check your quest log!"
                    }
                },
                { DialogueContext.Encouragement, new List<string>
                    {
                        "You can do it!",
                        "Great job, Hiro!",
                        "I believe in you!",
                        "We make a great team!"
                    }
                },
                { DialogueContext.Warning, new List<string>
                    {
                        "Be careful!",
                        "Watch out!",
                        "That looks dangerous...",
                        "Maybe we should think about this first."
                    }
                },
                { DialogueContext.Celebration, new List<string>
                    {
                        "We did it!",
                        "Amazing!",
                        "That was incredible!",
                        "I knew you could do it!"
                    }
                }
            };
        }
        
        private void Update()
        {
            // Random emotions when idle
            if (allowRandomEmotions && !isPlayingEmotion)
            {
                if (Random.value < randomEmotionChance * Time.deltaTime)
                {
                    PlayRandomIdleEmotion();
                }
            }
        }
        
        /// <summary>
        /// Play a specific emotion animation and effects
        /// </summary>
        public void PlayEmotion(EmotionType emotion)
        {
            if (Time.time - lastEmotionTime < emotionCooldown && !isPlayingEmotion)
            {
                return;
            }
            
            currentEmotion = emotion;
            lastEmotionTime = Time.time;
            
            StartCoroutine(PlayEmotionCoroutine(emotion));
        }
        
        private IEnumerator PlayEmotionCoroutine(EmotionType emotion)
        {
            isPlayingEmotion = true;
            
            // Play animation
            if (animator != null)
            {
                animator.SetTrigger(emotion.ToString());
            }
            
            // Play visual effects
            PlayEmotionVFX(emotion);
            
            // Play sound
            PlayEmotionSound(emotion);
            
            yield return new WaitForSeconds(emotionDuration);
            
            isPlayingEmotion = false;
            currentEmotion = EmotionType.Neutral;
        }
        
        private void PlayEmotionVFX(EmotionType emotion)
        {
            switch (emotion)
            {
                case EmotionType.Happy:
                    if (happyParticles != null) happyParticles.Play();
                    break;
                case EmotionType.Sad:
                    if (sadParticles != null) sadParticles.Play();
                    break;
                case EmotionType.Surprised:
                    if (surprisedParticles != null) surprisedParticles.Play();
                    break;
            }
        }
        
        private void PlayEmotionSound(EmotionType emotion)
        {
            List<AudioClip> soundList = null;
            
            switch (emotion)
            {
                case EmotionType.Happy:
                    soundList = happySounds;
                    break;
                case EmotionType.Sad:
                    soundList = sadSounds;
                    break;
                case EmotionType.Surprised:
                    soundList = surprisedSounds;
                    break;
                case EmotionType.Thinking:
                    soundList = thinkingSounds;
                    break;
            }
            
            if (soundList != null && soundList.Count > 0 && audioSource != null)
            {
                AudioClip clip = soundList[Random.Range(0, soundList.Count)];
                audioSource.PlayOneShot(clip);
            }
        }
        
        /// <summary>
        /// Play a random idle emotion
        /// </summary>
        public void PlayRandomIdleEmotion()
        {
            EmotionType[] idleEmotions = { EmotionType.Happy, EmotionType.Thinking, EmotionType.LookAround };
            EmotionType randomEmotion = idleEmotions[Random.Range(0, idleEmotions.Length)];
            PlayEmotion(randomEmotion);
        }
        
        /// <summary>
        /// Say a dialogue line based on context
        /// </summary>
        public void SayDialogue(DialogueContext context)
        {
            if (!enableDialogue) return;
            
            if (Time.time - lastDialogueTime < dialogueCooldown)
            {
                return;
            }
            
            if (dialogueDatabase.ContainsKey(context))
            {
                List<string> dialogues = dialogueDatabase[context];
                if (dialogues.Count > 0)
                {
                    string dialogue = dialogues[Random.Range(0, dialogues.Count)];
                    ShowDialogue(dialogue);
                    lastDialogueTime = Time.time;
                }
            }
        }
        
        /// <summary>
        /// Say a custom dialogue line
        /// </summary>
        public void SayCustomDialogue(string dialogue)
        {
            if (!enableDialogue) return;
            ShowDialogue(dialogue);
            lastDialogueTime = Time.time;
        }
        
        private void ShowDialogue(string text)
        {
            // Trigger UI event to show dialogue
            Core.GameEvents.ShowCompanionDialogue(text, emotionDuration);
            
            Debug.Log($"[Companion] {text}");
            
            // Play thinking animation
            if (animator != null)
            {
                animator.SetTrigger("Talk");
            }
        }
        
        /// <summary>
        /// Provide a helpful hint to the player
        /// </summary>
        public void GiveHint()
        {
            PlayEmotion(EmotionType.Thinking);
            SayDialogue(DialogueContext.Hint);
        }
        
        /// <summary>
        /// React to player action
        /// </summary>
        public void ReactToPlayerAction(PlayerAction action)
        {
            switch (action)
            {
                case PlayerAction.UsedGadget:
                    PlayEmotion(EmotionType.Happy);
                    break;
                case PlayerAction.CompletedQuest:
                    PlayEmotion(EmotionType.Happy);
                    SayDialogue(DialogueContext.Celebration);
                    break;
                case PlayerAction.TookDamage:
                    PlayEmotion(EmotionType.Worried);
                    SayDialogue(DialogueContext.Warning);
                    break;
                case PlayerAction.Jumped:
                    if (Random.value < 0.3f) PlayEmotion(EmotionType.Surprised);
                    break;
            }
        }
        
        /// <summary>
        /// Set emotion duration
        /// </summary>
        public void SetEmotionDuration(float duration)
        {
            emotionDuration = duration;
        }
        
        /// <summary>
        /// Enable or disable dialogue system
        /// </summary>
        public void SetDialogueEnabled(bool enabled)
        {
            enableDialogue = enabled;
        }
        
        public EmotionType GetCurrentEmotion() => currentEmotion;
        public bool IsPlayingEmotion() => isPlayingEmotion;
    }
    
    /// <summary>
    /// Different emotional states the companion can express
    /// </summary>
    public enum EmotionType
    {
        Neutral,
        Happy,
        Sad,
        Surprised,
        Worried,
        Thinking,
        LookAround,
        Wave
    }
    
    /// <summary>
    /// Different contexts for companion dialogue
    /// </summary>
    public enum DialogueContext
    {
        Greeting,
        Idle,
        Hint,
        Encouragement,
        Warning,
        Celebration
    }
    
    /// <summary>
    /// Player actions that the companion can react to
    /// </summary>
    public enum PlayerAction
    {
        UsedGadget,
        CompletedQuest,
        TookDamage,
        Jumped,
        Landed,
        Sprinting
    }
}
