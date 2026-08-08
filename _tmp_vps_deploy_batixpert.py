#!/usr/bin/env python3
"""Deploy BatiXpert update to batixpert.a2spr.com (preserve .env)."""
import os
import sys
import tarfile
import tempfile
import time
from pathlib import Path

import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST = "51.255.162.99"
USER = "ubuntu"
PW = os.environ.get("VPS_SSH_PASSWORD", "A2sprVps2026!Secure")
FQDN = "batixpert.a2spr.com"
APP = f"/var/www/{FQDN}/app"
LOCAL = Path(__file__).resolve().parent

EXCLUDE_DIRS = {".git", "node_modules", "vendor", "_tmp_vps", ".cursor"}
EXCLUDE_FILES = {".env", ".env.local", ".env.production"}
EXCLUDE_PREFIXES = ("_tmp_vps_",)


def should_exclude(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    if any(p in EXCLUDE_DIRS for p in rel.parts):
        return True
    if path.name in EXCLUDE_FILES:
        return True
    if any(path.name.startswith(p) for p in EXCLUDE_PREFIXES):
        return True
    return False


def make_tarball() -> Path:
    tmp = tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False)
    tmp.close()
    tar_path = Path(tmp.name)
    with tarfile.open(tar_path, "w:gz") as tar:
        for item in LOCAL.rglob("*"):
            if should_exclude(item, LOCAL):
                continue
            if item.is_file():
                tar.add(item, arcname=item.relative_to(LOCAL).as_posix())
    return tar_path


def run(c, cmd, t=900, check=True):
    print(f"\n>>> {cmd[:280]}", flush=True)
    _stdin, stdout, stderr = c.exec_command(cmd, timeout=t, get_pty=True)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    text = (out + "\n" + err).strip()
    if text:
        print(text[-6000:], flush=True)
    if check and code != 0:
        raise RuntimeError(f"Command failed ({code}): {cmd[:120]}")
    return code, text


def main():
    print(f"Deploying to {FQDN} ...", flush=True)
    tar_path = make_tarball()
    remote_tar = f"/tmp/batixpert_deploy_{int(time.time())}.tar.gz"

    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username=USER, password=PW, timeout=30, allow_agent=False, look_for_keys=False)

    try:
        sftp = c.open_sftp()
        print(f"Uploading {tar_path} -> {remote_tar}", flush=True)
        sftp.put(str(tar_path), remote_tar)
        sftp.close()

        run(c, f"test -d {APP} || (echo 'App dir missing' && exit 1)")
        run(c, f"cp {APP}/.env /tmp/batixpert_env_backup 2>/dev/null || true", check=False)
        run(c, f"cd {APP} && tar -xzf {remote_tar} --strip-components=0")
        run(c, f"cp /tmp/batixpert_env_backup {APP}/.env 2>/dev/null || true", check=False)
        run(c, f"rm -f {remote_tar}")

        run(c, f"cd {APP} && composer install --no-dev --optimize-autoloader --no-interaction")
        run(c, f"cd {APP} && npm ci && npm run build", t=1200)
        run(c, f"cd {APP} && php artisan migrate --force")
        run(c, f"cd {APP} && php artisan config:cache && php artisan route:cache && php artisan view:cache")
        run(c, f"sudo chown -R ubuntu:www-data {APP} && sudo chmod -R g+w {APP}/storage {APP}/bootstrap/cache")

        code, text = run(c, f"curl -s -o /dev/null -w '%{{http_code}}' https://{FQDN}/")
        print(f"\nHTTPS status: {text.strip()}", flush=True)
        print(f"\nDone: https://{FQDN}", flush=True)
    finally:
        c.close()
        try:
            tar_path.unlink(missing_ok=True)
        except Exception:
            pass


if __name__ == "__main__":
    main()
