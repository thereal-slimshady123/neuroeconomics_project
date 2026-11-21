"""
weight_sensitivity.py
Robustness of the main test (GP ~ S + R + S x R) to how S and R weight their parts.

S averages Predictability (P), Recent gaps (D) and Buffer; R averages Dependents (Dep) and Cash commitments (Cash).
The pre-registered scores give every part an equal weight. This script refits the main test under
  (A) named alternative weightings, one score changed at a time,
  (B) data-driven weights (first principal component of the parts),
  (C) 2,000 random weightings of S and R together,
and reports how the S and R effects, R^2 and the four-group assignment change.

Usage: python weight_sensitivity.py --live | --data responses.xlsx | (no flag: simulated data)
"""

import argparse
import numpy as np
import pandas as pd

from analyze_results import (compute_intake_scores, compute_game_metrics, load_live_data,
                             load_real_data, simulate_v2_data, ols)

S_PARTS, R_PARTS = ["P", "D", "Buffer"], ["Dep", "Cash"]
S_CUT, R_CUT = 0.5, 0.35


def build_scores(df, ws, wr, student_cap=True):
    """Weighted S and R, weights normalised to sum to 1 so both stay on 0-1. Student S is scaled by 0.5."""
    ws, wr = np.asarray(ws, float) / np.sum(ws), np.asarray(wr, float) / np.sum(wr)
    s = df[S_PARTS].values @ ws
    if student_cap:
        is_student = df["Cohort"].astype(str).str.lower().str.contains("student").values
        s = np.where(is_student, 0.5 * s, s)  # same student scaling as analyze_results.py
    return s, df[R_PARTS].values @ wr


def quadrant(s, r):
    return (s > S_CUT).astype(int) * 2 + (r >= R_CUT).astype(int)


def fit(df, s, r):
    """Same model as H1: centred S and R plus their interaction."""
    sc, rc = s - s.mean(), r - r.mean()
    X = np.column_stack([np.ones(len(s)), sc, rc, sc * rc])
    table, r2, p = ols(df["GP"].values.astype(float), X, ["Intercept", "S", "R", "S x R"])
    return table, r2, p


def pca_weights(df, parts):
    """Loadings of the first principal component of the standardised parts, made positive and summing to 1."""
    z = df[parts].apply(lambda c: (c - c.mean()) / c.std(ddof=1)).values
    vals, vecs = np.linalg.eigh(np.cov(z, rowvar=False))
    w = np.abs(vecs[:, -1])
    return w / w.sum(), vals[-1] / vals.sum()


def main(df):
    base_s, base_r = build_scores(df, [1, 1, 1], [1, 1])
    base_q = quadrant(base_s, base_r)

    def row(label, ws, wr, cap=True):
        s, r = build_scores(df, ws, wr, cap)
        t, r2, _ = fit(df, s, r)
        moved = int((quadrant(s, r) != base_q).sum())
        return {"Scheme": label, "b_S": t.loc["S", "b"], "p_S": t.loc["S", "p"],
                "b_R": t.loc["R", "b"], "p_R": t.loc["R", "p"], "p_SxR": t.loc["S x R", "p"],
                "R2": r2, "Moved group": f"{moved}/{len(df)}"}

    ws_pca, ev_s = pca_weights(df, S_PARTS)
    wr_pca, ev_r = pca_weights(df, R_PARTS)

    schemes = [
        ("Baseline: equal weights", [1, 1, 1], [1, 1]),
        ("S: Predictability x2", [2, 1, 1], [1, 1]),
        ("S: Recent gaps x2", [1, 2, 1], [1, 1]),
        ("S: Buffer x2", [1, 1, 2], [1, 1]),
        ("S: drop Predictability", [0, 1, 1], [1, 1]),
        ("S: drop Recent gaps", [1, 0, 1], [1, 1]),
        ("S: drop Buffer", [1, 1, 0], [1, 1]),
        ("R: Dependents x2", [1, 1, 1], [2, 1]),
        ("R: Cash x2", [1, 1, 1], [1, 2]),
        ("R: Dependents only", [1, 1, 1], [1, 0]),
        ("R: Cash only", [1, 1, 1], [0, 1]),
        (f"PCA weights (S {ws_pca.round(2).tolist()}, R {wr_pca.round(2).tolist()})", ws_pca, wr_pca),
    ]
    rows = [row(*sc) for sc in schemes] + [row("No student scaling on S", [1, 1, 1], [1, 1], cap=False)]
    res = pd.DataFrame(rows).set_index("Scheme")

    pd.set_option("display.width", 200)
    pd.set_option("display.max_colwidth", 60)
    fmt = {"b_S": "{:+.1f}".format, "b_R": "{:+.1f}".format, "R2": "{:.2f}".format,
           "p_S": "{:.2g}".format, "p_R": "{:.2g}".format, "p_SxR": "{:.2g}".format}
    print(f"\n(A, B) Named and data-driven weightings, N = {len(df)}. b = gamble-rate points for a 0 -> 1 step:")
    print(res.to_string(formatters=fmt))
    print(f"  PCA first component explains {ev_s:.0%} of the variance of the S parts and {ev_r:.0%} of the R parts.")

    # (C) Random weights: Dirichlet(1,1,1) for S and a uniform split for R, drawn together.
    rng = np.random.default_rng(0)
    draws = []
    for _ in range(2000):
        ws, a = rng.dirichlet([1, 1, 1]), rng.uniform()
        s, r = build_scores(df, ws, [a, 1 - a])
        t, r2, _ = fit(df, s, r)
        draws.append((t.loc["S", "b"], t.loc["S", "p"], t.loc["R", "b"], t.loc["R", "p"], r2,
                      (quadrant(s, r) != base_q).sum()))
    d = pd.DataFrame(draws, columns=["bS", "pS", "bR", "pR", "R2", "moved"])
    lo, hi = 5, 95
    print("\n(C) 2,000 random weightings of S and R:")
    print(f"  S effect positive and p < .05 in {((d.bS > 0) & (d.pS < .05)).mean():.0%} of draws "
          f"(b_S {np.percentile(d.bS, lo):+.0f} to {np.percentile(d.bS, hi):+.0f}, middle 90%)")
    print(f"  R effect negative and p < .05 in {((d.bR < 0) & (d.pR < .05)).mean():.0%} of draws "
          f"(b_R {np.percentile(d.bR, lo):+.0f} to {np.percentile(d.bR, hi):+.0f})")
    print(f"  R^2 {np.percentile(d.R2, lo):.2f} to {np.percentile(d.R2, hi):.2f} "
          f"(baseline {res.iloc[0]['R2']:.2f}); best of all draws {d.R2.max():.2f}")
    print(f"  People who change group: median {np.median(d.moved):.0f}, "
          f"90th percentile {np.percentile(d.moved, 90):.0f} of {len(df)}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[2])
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--live", action="store_true", help="Fetch the current responses from the Google Sheet.")
    src.add_argument("--data", help="Exported responses (.xlsx or .csv).")
    args = ap.parse_args()
    df = load_live_data() if args.live else load_real_data(args.data) if args.data else simulate_v2_data(n=120)
    main(compute_game_metrics(compute_intake_scores(df)))
