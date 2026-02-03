from sklearn.metrics import roc_auc_score, recall_score, classification_report

def evaluate(model, X_test, y_test):
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob > 0.5).astype(int)

    return {
        "roc_auc": roc_auc_score(y_test, y_prob),
        "recall": recall_score(y_test, y_pred),
        "report": classification_report(y_test, y_pred)
    }
