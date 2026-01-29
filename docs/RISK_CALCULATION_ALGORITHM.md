# Visit Assessment Risk Calculation Algorithm

## Overview

The risk calculation algorithm evaluates senior citizens across 4 key dimensions to generate a comprehensive vulnerability score (0-100 points). This score is then mapped to vulnerability levels used for prioritizing visits and resource allocation.

---

## Scoring Structure

### Maximum Points by Section

| Section | Max Points | Weight |
|---------|-----------|--------|
| Physical Safety | 35 | 35% |
| Health & Mental Well-Being | 30 | 30% |
| Cyber Vulnerability | 25 | 25% |
| Sense of Safety | 10 | 10% |
| **Total** | **100** | **100%** |

---

## Section 1: Physical Safety (35 points)

| Field | Response | Points | Rationale |
|-------|----------|--------|-----------|
| **Emergency Awareness** | No | +10 | Lack of emergency preparedness increases vulnerability |
| | Yes | 0 | Baseline safety knowledge |
| **Time Alone** | Often | +10 | Extended isolation increases risk |
| | Sometimes | +5 | Moderate isolation concern |
| | Rarely | 0 | Regular social contact |
| **Maid Verification** | Not Verified | +5 | Unverified help poses security risk |
| | Temporary | 0 | Temporary arrangement |
| | Permanent | 0 | Verified permanent help |
| **CCTV Presence** | No | +5 | Lack of surveillance increases vulnerability |
| | Yes | 0 | Security monitoring present |
| **Lighting Conditions** | Poor | +5 | Poor lighting increases fall/crime risk |
| | Average | 0 | Adequate lighting |
| | Good | 0 | Well-lit environment |
| **Mobility** | Limited Mobility | +15 | Severe mobility restriction - highest risk |
| | Needs Support | +8 | Moderate mobility issues |
| | Fully Mobile | 0 | Independent movement |

**Section Total**: 0-35 points

---

## Section 2: Health & Mental Well-Being (30 points)

| Field | Response | Points | Rationale |
|-------|----------|--------|-----------|
| **Illness Type** | Chronic | +10 | Long-term health management required |
| | Acute | +5 | Temporary health concern |
| | None | 0 | No current illness |
| **Physical Status** | Poor | +10 | Significant physical limitations |
| | Moderate | +5 | Some physical challenges |
| | Good | 0 | Healthy physical condition |
| **Mental Status** | Poor | +10 | Severe mental health concerns |
| | Needs Support | +5 | Mental health support required |
| | Good | 0 | Stable mental health |

**Section Total**: 0-30 points

**Note**: Current illness (text field) is captured for reference but not scored.

---

## Section 3: Cyber Vulnerability (25 points)

### Conditional Scoring Logic

**If Uses Smartphone = No**: Section score = 0 (no cyber risk)

**If Uses Smartphone = Yes**: Apply the following scoring:

| Field | Response | Points | Rationale |
|-------|----------|--------|-----------|
| **Cyber Victim** | Yes | +15 | Already victimized - highest cyber risk |
| **Cyber Attempt** | Yes | +10 | Targeted but not victimized (only if not a victim) |
| **Online Activity** | High | +5 | Increased exposure to cyber threats |
| | Medium | +3 | Moderate online presence |
| | Low | 0 | Minimal online exposure |
| **Delivery Frequency** | Frequent | +5 | Regular online transactions increase risk |
| | Occasional | 0 | Moderate online shopping |
| | Rare | 0 | Minimal online purchases |

**Section Total**: 0-25 points

**Important**: If citizen is a cyber victim (+15), do NOT add cyber attempt points (mutually exclusive).

---

## Section 4: Sense of Safety (10 points)

| Field | Response | Points | Rationale |
|-------|----------|--------|-----------|
| **Feels Safe at Home** | No | +10 | Subjective safety concern - important indicator |
| | Yes | 0 | Feels secure in environment |

**Section Total**: 0-10 points

**Note**: Safety concerns (text field) is captured for context but not scored.

---

## Vulnerability Level Mapping

The total risk score (0-100) is mapped to vulnerability levels:

| Score Range | Vulnerability Level | Priority | Recommended Action |
|-------------|-------------------|----------|-------------------|
| 0-30 | **Low** | Routine | Standard quarterly visits |
| 31-50 | **Medium** | Moderate | Monthly monitoring |
| 51-70 | **High** | Elevated | Bi-weekly check-ins |
| 71-100 | **Critical** | Urgent | Weekly visits + immediate intervention |

---

## Risk Calculation Examples

### Example 1: Low Risk (Score: 5)

| Section | Responses | Points |
|---------|-----------|--------|
| **Physical Safety** | Emergency aware, Rarely alone, Permanent maid, CCTV present, Good lighting, Fully mobile | 0 |
| **Health & Mental** | No illness, Good physical, Good mental | 0 |
| **Cyber** | No smartphone | 0 |
| **Safety** | Feels safe, Maid not verified | 5 |
| **Total** | | **5 → Low** |

---

### Example 2: Medium Risk (Score: 45)

| Section | Responses | Points |
|---------|-----------|--------|
| **Physical Safety** | No emergency awareness (+10), Sometimes alone (+5), Not verified maid (+5), No CCTV (+5), Fully mobile | 25 |
| **Health & Mental** | Acute illness (+5), Moderate physical (+5), Good mental | 10 |
| **Cyber** | Uses smartphone, Cyber attempt (+10), Low activity | 10 |
| **Safety** | Feels safe | 0 |
| **Total** | | **45 → Medium** |

---

### Example 3: High Risk (Score: 70)

| Section | Responses | Points |
|---------|-----------|--------|
| **Physical Safety** | No emergency awareness (+10), Often alone (+10), Not verified (+5), No CCTV (+5), Needs support (+8) | 35 (capped) |
| **Health & Mental** | Chronic illness (+10), Poor physical (+10), Needs support (+5) | 25 |
| **Cyber** | No smartphone | 0 |
| **Safety** | Doesn't feel safe (+10) | 10 |
| **Total** | | **70 → High** |

---

### Example 4: Critical Risk (Score: 100)

| Section | Responses | Points |
|---------|-----------|--------|
| **Physical Safety** | No emergency awareness (+10), Often alone (+10), Not verified (+5), No CCTV (+5), Poor lighting (+5), Limited mobility (+15) | 35 (capped) |
| **Health & Mental** | Chronic illness (+10), Poor physical (+10), Poor mental (+10) | 30 |
| **Cyber** | Uses smartphone, Cyber victim (+15), High activity (+5), Frequent deliveries (+5) | 25 |
| **Safety** | Doesn't feel safe (+10) | 10 |
| **Total** | | **100 → Critical** |

---

## Implementation Code

### Frontend Calculation

**File**: `app/officer-app/visits/[id]/page.tsx` (Lines 149-194)

```typescript
useEffect(() => {
  let score = 0;

  // Physical Safety (Max: 35)
  if (emergencyAwareness === 'No') score += 10;
  if (aloneTime === 'Often') score += 10;
  else if (aloneTime === 'Sometimes') score += 5;
  if (maidVerification === 'Not Verified') score += 5;
  if (cctvPresence === 'No') score += 5;
  if (lightingConditions === 'Poor') score += 5;
  if (mobility === 'Limited Mobility') score += 15;
  else if (mobility === 'Needs Support') score += 8;

  // Health & Mental (Max: 30)
  if (illnessType === 'Chronic') score += 10;
  else if (illnessType === 'Acute') score += 5;
  if (physicalStatus === 'Poor') score += 10;
  else if (physicalStatus === 'Moderate') score += 5;
  if (mentalStatus === 'Poor') score += 10;
  else if (mentalStatus === 'Needs Support') score += 5;

  // Cyber Vulnerability (Max: 25)
  if (usesSmartphone === 'Yes') {
    if (cyberVictim === 'Yes') score += 15;
    else if (cyberAttempt === 'Yes') score += 10;
    if (onlineActivity === 'High') score += 5;
    else if (onlineActivity === 'Medium') score += 3;
    if (deliveryFrequency === 'Frequent') score += 5;
  }

  // Sense of Safety (Max: 10)
  if (safeAtHome === 'No') score += 10;

  // Cap at 100
  if (score > 100) score = 100;

  setRiskScore([score]);
}, [dependencies...]);
```

### Backend Vulnerability Mapping

**File**: `backend/src/controllers/visitController.ts` (Lines 421-428)

```typescript
let newVulnerabilityLevel = 'Low';
if (riskScore >= 71) newVulnerabilityLevel = 'Critical';
else if (riskScore >= 51) newVulnerabilityLevel = 'High';
else if (riskScore >= 31) newVulnerabilityLevel = 'Medium';
else newVulnerabilityLevel = 'Low';
```

---

## Key Features

### 1. Real-Time Calculation
- Score updates automatically as officer fills the form
- Immediate feedback on vulnerability level
- No manual calculation required

### 2. Weighted Priorities
- Physical safety (35%) - Highest weight due to immediate risk
- Health & mental (30%) - Critical for long-term wellbeing
- Cyber vulnerability (25%) - Growing concern for elderly
- Sense of safety (10%) - Subjective but important indicator

### 3. Conditional Logic
- Cyber vulnerability only scored if smartphone user
- Prevents false positives for non-digital citizens

### 4. Capping Mechanism
- Individual sections capped at maximum values
- Total score capped at 100
- Prevents score inflation from multiple high-risk factors

---

## Calibration Notes

### Expected Score Distribution
- **Low (0-30)**: ~40% of citizens
- **Medium (31-50)**: ~35% of citizens
- **High (51-70)**: ~20% of citizens
- **Critical (71-100)**: ~5% of citizens


## Color Coding :
Score Range	Badge Color	Progress Bar Color	Level
0-30	🟢 Green	🟢 Green	Low
31-50	🟡 Yellow	🟡 Yellow	Medium
51-70	🟠 Orange	🟠 Orange	High
71-100	🔴 Red	🔴 Red	Critical

### Adjustment Recommendations

If actual distribution differs significantly:

1. **Too many Low scores**: Consider lowering point values or tightening thresholds
2. **Too many Critical scores**: Consider raising point values or widening thresholds
3. **Uneven distribution**: Adjust section weights or individual field points

---

## Comparison with Old Algorithm

### Old Algorithm (Deprecated)
- Base score: 10 points
- Maximum: ~80 points
- 6 factors: Living alone, house security, health, mobility, isolation, suspicious activity
- Simple additive model

### New Algorithm (Current)
- Base score: 0 points
- Maximum: 100 points
- 17 factors across 4 comprehensive dimensions
- Weighted sections with conditional logic
- More granular and holistic assessment



**Key Improvements**:
- ✅ More comprehensive coverage (physical, mental, cyber, safety)
- ✅ Better score distribution (0-100 vs 10-80)
- ✅ Conditional logic for smartphone users
- ✅ Mental health dimension added
- ✅ Environmental factors included (CCTV, lighting)
- ✅ Subjective safety perception captured
