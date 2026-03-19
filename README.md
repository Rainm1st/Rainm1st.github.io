# TrainerSync: Gamifying the Onsite Gym Experience

**Group ID:** C3-6  
**Module:** CPT208 Human-Centric Computing  
[cite_start]**Theme:** Active Lifestyles (C3: Go Trainers) [cite: 1011, 1034]

---

## 1. Team Members & Contributions
| Name | Student ID | Core Role | Contribution Detail |
| :--- | :--- | :--- | :--- |
| [TBA] | [TBA] | UX Researcher | Conducted onsite interviews, persona creation, and usability testing analysis. |
| [TBA] | [TBA] | UI/UX Designer | Developed design system, Crazy Eights sketches, and high-fidelity Figma prototypes. |
| [TBA] | [TBA] | Front-end Dev | Built the web app core logic, responsive layout, and interactive dashboards. |
| [TBA] | [TBA] | QA & Video Lead | Managed heuristic evaluation, bug tracking, and edited the CHI-style video demo. |

---

## 2. Motivation & Research

### The Why
[cite_start]We chose the "Active Lifestyles" track focusing on "Go Trainers" (C3) because traditional onsite gym sessions often lack real-time, engaging feedback[cite: 1011, 1034]. Trainers struggle to monitor multiple trainees simultaneously, and trainees frequently experience cognitive fatigue and loss of focus. **TrainerSync** aims to bridge this gap by transforming static workout routines into a "Playful Experience", synchronizing trainer oversight with gamified, real-time trainee output.

### The Gap (Competitive Analysis)
We analyzed existing market solutions (e.g., Keep, Apple Fitness+, Strava) and identified critical gaps in the *onsite* experience:

* **What they do well (Pros):**
  1. Excellent asynchronous health data tracking and visualization.
  2. Comprehensive libraries of standardized workout videos.
  3. Strong asynchronous social features (leaderboards, sharing).
* **What they missed (Cons):**
  1. [cite_start]**Lack of Synchronous Onsite Interaction:** They fail to connect the trainer and trainee in real-time during a live physical session[cite: 1043, 1044].
  2. **Dry Statistics over Playfulness:** Data is presented as passive charts rather than active, game-like elements (e.g., energy bars, combos) during the workout.
  3. **No Co-op Dynamics:** Limited support for location-based, multi-user cooperative training tasks.

### The Stakeholders
* [cite_start]**Primary Users:** Gym Trainers & Instructors (Require an intuitive dashboard for real-time oversight and intervention)[cite: 1034].
* [cite_start]**Secondary Users:** Gym Trainees (Require instant, gamified visual/haptic feedback to maintain motivation)[cite: 1034].

---

## 3. User Requirements

### User Journey Map
> *

[Image of user_journey_map.png]
* *Current Pain Point:* At minute 15 of a HIIT session, the trainee hits a fatigue wall. The trainer is occupied correcting another client's posture. Without immediate feedback, the trainee's intensity drops, leading to suboptimal workout results.

### Playful Experience Requirements (Must-Haves)
To ensure the system delivers a genuinely human-centric and playful experience, it must include:
1. [cite_start]**Live Telemetry Gamification:** Convert real-time movement data (reps, pace) into visual "Energy Combo Streaks" on the user's mobile interface[cite: 1011].
2. **Trainer "Boost" Interventions:** A feature allowing trainers to send real-time digital "boosts" or visual cues from their dashboard to the trainees' devices.
3. [cite_start]**Location-Based Co-op Quests:** Aggregate group data onsite to complete a collective goal (e.g., "Group calorie burn unlocks the next workout phase")[cite: 1011].

### Evidence of Life
> *[Insert Image/GIF: onsite_interviews_or_observations.jpg]* *(Caption: Conducting contextual inquiry at a local Suzhou gym to understand trainer-trainee communication bottlenecks.)*

---

## 4. Ideation & Alternatives

### Rapid Prototyping: The "Crazy Eights"
> ** ### Design Alternatives & Decision
* **Alternative A: AR Pose Estimation (WebXR).** Trainees must face their camera to track movements. 
  * *Drawback:* Highly intrusive; forces users to look at screens instead of focusing on physical safety and spatial awareness.
* **Alternative B: Telemetry-Driven Dashboard.** Uses simple mobile taps or simulated wearable data to drive a gamified UI, focusing on audio and high-contrast visual cues.
* **Our Decision:** We proceeded with **Alternative B**. Onsite gym environments require hands-free mobility. A dashboard approach minimizes cognitive load while maximizing the "Playful" connection between trainer and trainee.

### Low-Fi Prototype
> *[Insert Link: Figma Low-Fi Prototype URL]*

---

## 5. Technical Implementation

### System Architecture
> ** The Web App is built with HTML/CSS/JS (or React), utilizing a simulated real-time state management system to reflect data syncing between the `Trainer View` and the `Trainee View`.

### High-Fi Prototype (Live System)
* **Live App URL:** [Insert GitHub Pages / Vercel Link Here]
* **Source Code:** [Insert GitHub Repo Link]

---

## 6. Evaluation & Reflection

### Usability Testing (Alpha Version)
We conducted heuristic evaluations and think-aloud testing with 3 target users.
* **Finding 1:** [E.g., Users found the "Boost" button too small on mobile].
* **Finding 2:** [E.g., The color contrast of the combo streak was hard to read under gym lighting].

### Iterative Refinement
> ** *(Caption: Based on testing, we increased the hit-box of primary CTAs and switched to a high-contrast dark mode UI.)*

### Final Reflection
*(To be completed in Week 10)*
* **Social/Ethical Implications:** How our system handles physical capability differences ensuring inclusivity (avoiding performance anxiety).
* [cite_start]**AI Usage Disclosure:** [Insert mandatory AI citation format here, e.g., using Cursor for vibe coding or Claude for script generation][cite: 996, 998].
