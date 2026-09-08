#!/usr/bin/env bash
set -u

ROOT_DIR="${HEALTH_PGX_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
REPORT_EMAIL="${SMOKE_REPORT_EMAIL:-pkureev@gmail.com}"
REPORT_DIR="${SMOKE_REPORT_DIR:-$ROOT_DIR/var/smoke}"
TODAY="$(date +%F)"
RUN_AT="$(date '+%F %H:%M:%S %Z')"
DAILY_LOG="$REPORT_DIR/smoke-$TODAY.log"
STAMP_FILE="$REPORT_DIR/email-sent-$TODAY"
CURRENT_REPORT="$REPORT_DIR/report-$TODAY-$(date +%H%M%S).txt"

mkdir -p "$REPORT_DIR"
cd "$ROOT_DIR" || exit 1

{
  echo "===== Smoke run: $RUN_AT ====="
  npm run smoke:prod
  echo
} > "$CURRENT_REPORT" 2>&1
STATUS=$?

cat "$CURRENT_REPORT" >> "$DAILY_LOG"

if [ -f "$STAMP_FILE" ]; then
  exit "$STATUS"
fi

if [ "$STATUS" -eq 0 ]; then
  SUBJECT="Разборчиво: smoke OK за $TODAY"
else
  SUBJECT="Разборчиво: smoke FAILED за $TODAY"
fi

send_with_mail() {
  if command -v mail >/dev/null 2>&1; then
    mail -s "$SUBJECT" "$REPORT_EMAIL" < "$DAILY_LOG"
    return $?
  fi
  if command -v mailx >/dev/null 2>&1; then
    mailx -s "$SUBJECT" "$REPORT_EMAIL" < "$DAILY_LOG"
    return $?
  fi
  return 127
}

send_with_sendmail() {
  if ! command -v sendmail >/dev/null 2>&1; then
    return 127
  fi
  {
    echo "To: $REPORT_EMAIL"
    echo "Subject: $SUBJECT"
    echo "Content-Type: text/plain; charset=UTF-8"
    echo
    cat "$DAILY_LOG"
  } | sendmail -t
}

if send_with_mail || send_with_sendmail; then
  touch "$STAMP_FILE"
else
  echo "Unable to send smoke report: install/configure mail, mailx, or sendmail." >&2
  exit 1
fi

exit "$STATUS"
