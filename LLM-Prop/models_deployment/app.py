import streamlit as st
from predict_all import predict_all


def interpret_energy_per_atom(value):
    if value < -5:
        return "Very low energy per atom, which usually indicates strongly bound atoms and high energetic stability."
    if value < -2:
        return "Low energy per atom, suggesting a reasonably stable bonded structure."
    if value < 0:
        return "Slightly negative energy per atom, often meaning moderate energetic stability."
    return "Positive energy per atom, which can indicate weak binding or an energetically unfavorable structure."


def interpret_formation_energy_per_atom(value):
    if value < 0:
        return "Negative formation energy, so forming this material from reference elements is thermodynamically favorable."
    return "Positive formation energy, so formation is thermodynamically less favorable under standard conditions."


def interpret_band_gap(value):
    if value < 0.1:
        return "Near-zero band gap, so the material is likely metallic or very highly conductive."
    if value < 1.0:
        return "Small band gap, typically a narrow-gap semiconductor with easier charge excitation."
    if value < 3.0:
        return "Moderate band gap, consistent with common semiconducting behavior."
    return "Large band gap, indicating wide-gap semiconducting or insulating behavior."


def interpret_e_above_hull(value):
    if value <= 0.02:
        return "Very close to the convex hull, so this phase is likely thermodynamically stable."
    if value <= 0.10:
        return "Slightly above hull, often interpreted as metastable but still potentially synthesizable."
    return "Well above hull, suggesting lower thermodynamic stability and more difficult synthesis."


def interpret_volume(value):
    if value < 80:
        return "Relatively compact predicted structure volume."
    if value < 200:
        return "Moderate predicted structure volume."
    return "Large predicted structure volume, which can imply a more open crystal arrangement."


def combined_interpretation(result, prob, band_gap_value, e_above_hull_value, fepa_value):
    electrical_profile = (
        "metal-like conductivity"
        if band_gap_value < 0.1
        else "semiconducting behavior"
        if band_gap_value < 3.0
        else "insulating or wide-gap semiconducting behavior"
    )

    stability_profile = (
        "high thermodynamic stability"
        if e_above_hull_value <= 0.02 and fepa_value < 0
        else "moderate or metastable thermodynamic behavior"
        if e_above_hull_value <= 0.10
        else "low thermodynamic stability"
    )

    classification_profile = (
        "The model predicts a direct band gap."
        if result == "TRUE"
        else "The model predicts a non-direct (indirect) band gap."
    )

    confidence_note = (
        "Prediction confidence is close to the classification threshold, so treat the direct/indirect label with caution."
        if abs(prob - THRESHOLD) < 0.10
        else "Prediction confidence is reasonably separated from the threshold."
    )

    return (
        f"Overall, this material looks like {electrical_profile} with {stability_profile}. "
        f"{classification_profile} {confidence_note}"
    )

st.set_page_config(page_title="Crystal Predictor", layout="centered")

st.title("🔬 Crystal Property Predictor")
st.write(
    "Predict is_gap_direct, energy_per_atom, formation_energy_per_atom, band_gap, e_above_hull, and volume"
)

# Input
user_input = st.text_area("Enter crystal description:")

# Fixed threshold
THRESHOLD = 0.33

# Button
if st.button("Predict"):
    if user_input.strip() == "":
        st.warning("Please enter some text")
    else:
        with st.spinner("Running all models..."):
            predictions = predict_all(user_input, threshold=THRESHOLD)
            result = predictions["is_gap_direct"]
            prob = predictions["confidence"]
            epa_value = predictions["energy_per_atom"]
            fepa_value = predictions["formation_energy_per_atom"]
            band_gap_value = predictions["band_gap"]
            e_above_hull_value = predictions["e_above_hull"]
            volume_value = predictions["volume"]

        st.subheader("Result")

        col_1, col_2 = st.columns(2)
        col_3, col_4 = st.columns(2)
        col_5, col_6 = st.columns(2)

        with col_1:
            st.markdown("**is_gap_direct**")
            if result == "TRUE":
                st.markdown(
                    "<p style='color:#1B9E77;font-weight:700;'>Prediction: TRUE ✅</p>",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    "<p style='color:#D95F02;font-weight:700;'>Prediction: FALSE ❌</p>",
                    unsafe_allow_html=True,
                )
            st.markdown(
                f"<p style='color:#6A3D9A;font-weight:600;'>Confidence: {prob:.4f}</p>",
                unsafe_allow_html=True,
            )

        with col_2:
            st.markdown("**energy_per_atom**")
            st.markdown(
                f"<p style='color:#0072B2;font-weight:600;'>Predicted value: {epa_value:.6f}</p>",
                unsafe_allow_html=True,
            )

        with col_3:
            st.markdown("**formation_energy_per_atom**")
            st.markdown(
                f"<p style='color:#E69F00;font-weight:600;'>Predicted value: {fepa_value:.6f}</p>",
                unsafe_allow_html=True,
            )

        with col_4:
            st.markdown("**band_gap**")
            st.markdown(
                f"<p style='color:#009E73;font-weight:600;'>Predicted value: {band_gap_value:.6f}</p>",
                unsafe_allow_html=True,
            )

        with col_5:
            st.markdown("**e_above_hull**")
            st.markdown(
                f"<p style='color:#CC79A7;font-weight:600;'>Predicted value: {e_above_hull_value:.6f}</p>",
                unsafe_allow_html=True,
            )

        with col_6:
            st.markdown("**volume**")
            st.markdown(
                f"<p style='color:#D55E00;font-weight:600;'>Predicted value: {volume_value:.6f}</p>",
                unsafe_allow_html=True,
            )

        st.markdown("---")
        st.subheader("What These Predictions Mean")
        st.markdown(
            f"- **energy_per_atom ({epa_value:.6f})**: {interpret_energy_per_atom(epa_value)}\n"
            f"- **formation_energy_per_atom ({fepa_value:.6f})**: {interpret_formation_energy_per_atom(fepa_value)}\n"
            f"- **band_gap ({band_gap_value:.6f})**: {interpret_band_gap(band_gap_value)}\n"
            f"- **e_above_hull ({e_above_hull_value:.6f})**: {interpret_e_above_hull(e_above_hull_value)}\n"
            f"- **volume ({volume_value:.6f})**: {interpret_volume(volume_value)}"
        )

        st.subheader("Combined Interpretation")
        st.info(
            combined_interpretation(
                result,
                prob,
                band_gap_value,
                e_above_hull_value,
                fepa_value,
            )
        )