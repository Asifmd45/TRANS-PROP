from predict_is_gap_direct import predict
from predict_epa import predict_epa
from predict_fepa import predict_fepa
from predict_band_gap import predict_band_gap
from predict_e_above_hull import predict_e_above_hull
from predict_volume import predict_volume


def predict_all(text, threshold=0.33, max_length=256):
    is_gap_direct, confidence = predict(text, threshold=threshold)
    energy_per_atom = predict_epa(text, max_length=max_length)
    formation_energy_per_atom = predict_fepa(text, max_length=max_length)
    band_gap = predict_band_gap(text, max_length=max_length)
    e_above_hull = predict_e_above_hull(text, max_length=max_length)
    volume = predict_volume(text, max_length=max_length)

    return {
        "is_gap_direct": is_gap_direct,
        "confidence": confidence,
        "energy_per_atom": energy_per_atom,
        "formation_energy_per_atom": formation_energy_per_atom,
        "band_gap": band_gap,
        "e_above_hull": e_above_hull,
        "volume": volume,
    }
