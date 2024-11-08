interface ApifyAccount {
  email: string;
  token: string;
  isBlocked: boolean;
  lastUsed: Date;
  failureCount: number;
  cooldownUntil?: Date;
}

class ApifyAccountManager {
  private accounts: ApifyAccount[] = [];
  private currentIndex: number = 0;
  private MAX_FAILURES = 3;
  private COOLDOWN_DURATION = 1000 * 60 * 30; // 30 minutes

  constructor(accounts: Array<{ email: string; token: string }>) {
    this.accounts = accounts.map((acc) => ({
      ...acc,
      isBlocked: false,
      lastUsed: new Date(0),
      failureCount: 0,
    }));
  }

  private isAccountAvailable(account: ApifyAccount): boolean {
    if (account.isBlocked) return false;
    if (account.cooldownUntil && account.cooldownUntil > new Date())
      return false;
    return true;
  }

  getNextAvailableAccount(): ApifyAccount | null {
    const startIndex = this.currentIndex;
    do {
      const account = this.accounts[this.currentIndex];
      if (this.isAccountAvailable(account)) {
        account.lastUsed = new Date();
        return account;
      }
      this.currentIndex = (this.currentIndex + 1) % this.accounts.length;
    } while (this.currentIndex !== startIndex);

    return null;
  }

  markAccountFailure(email: string) {
    const account = this.accounts.find((acc) => acc.email === email);
    if (account) {
      account.failureCount++;
      if (account.failureCount >= this.MAX_FAILURES) {
        account.isBlocked = true;
        account.cooldownUntil = new Date(Date.now() + this.COOLDOWN_DURATION);
        account.failureCount = 0;
      }
    }
  }

  resetAccount(email: string) {
    const account = this.accounts.find((acc) => acc.email === email);
    if (account) {
      account.failureCount = 0;
      account.isBlocked = false;
      account.cooldownUntil = undefined;
    }
  }
}

export default ApifyAccountManager;
