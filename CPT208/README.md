# TrainerSync: Gamifying the Onsite Gym Experience

**Group ID:** C3-6  
**Module:** CPT208 Human-Centric Computing  
**Theme:** Active Lifestyles (C3: Go Trainers)

---

## 1. Team Members & Contributions

| Name | Student ID | Core Role | Contribution Detail |
| :--- | :--- | :--- | :--- |
| | | | |

---

## 2. Motivation & Research

### The Why
We chose the "Active Lifestyles" track focusing on "Go Trainers" (C3) because traditional onsite gym sessions often lack real-time, engaging feedback. Trainers struggle to monitor multiple trainees simultaneously, and trainees frequently experience cognitive fatigue and loss of focus. **TrainerSync** aims to bridge this gap by transforming static workout routines into a "Playful Experience", synchronizing trainer oversight with gamified, real-time trainee output.

### The Gap (Competitive Analysis)
We analyzed existing market solutions (e.g., Keep, Apple Fitness+, Strava) and identified critical gaps in the onsite experience:

* **What they do well (Pros):** Excellent asynchronous health data tracking and visualization; comprehensive libraries of standardized workout videos; strong asynchronous social features.
* **What they missed (Cons):** Lack of synchronous onsite interaction between trainer and trainee; data is presented as passive charts rather than active, game-like elements; no support for location-based, multi-user cooperative training tasks.

### The Stakeholders
* **Primary Users:** Gym Trainers & Instructors (Require an intuitive dashboard for real-time oversight and intervention).
* **Secondary Users:** Gym Trainees (Require instant, gamified visual/haptic feedback to maintain motivation).

---

## 3. User Requirements

### Playful Experience Requirements (Must-Haves)
To ensure the system delivers a genuinely human-centric and playful experience, it must include:
1. **Live Telemetry Gamification:** Convert real-time movement data into visual "Energy Combo Streaks" on the user's mobile interface.
2. **Trainer "Boost" Interventions:** A feature allowing trainers to send real-time digital "boosts" or visual cues from their dashboard to the trainees' devices.
3. **Location-Based Co-op Quests:** Aggregate group data onsite to complete a collective goal.

---

## 4. Ideation & Alternatives

### Design Alternatives & Decision
* **Alternative A: AR Pose Estimation (WebXR).** Trainees must face their camera to track movements. Highly intrusive; forces users to look at screens instead of focusing on physical safety and spatial awareness.
* **Alternative B: Telemetry-Driven Dashboard.** Uses simple mobile taps or simulated wearable data to drive a gamified UI, focusing on audio and high-contrast visual cues.
* **Our Decision:** We proceeded with **Alternative B**. Onsite gym environments require hands-free mobility. A dashboard approach minimizes cognitive load while maximizing the "Playful" connection between trainer and trainee.

---

## 5. Technical Implementation

The Web App utilizes a simulated real-time state management system to reflect data syncing between the `Trainer View` and the `Trainee View`.

---

## 6. Evaluation & Reflection

*(To be populated post-usability testing)*
