package com.spaservice.exception;

import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.UUID;

public class BranchLockedException extends AppException {
    private final UUID branchId;
    private final BigDecimal unlockBasePrice;
    private final BigDecimal taxRate;
    private final BigDecimal totalPrice;

    public BranchLockedException(UUID branchId, String branchName) {
        super(String.format("Staff availability at '%s' is locked. A ₹99 daily unlock is required.", branchName), HttpStatus.PAYMENT_REQUIRED);
        this.branchId = branchId;
        this.unlockBasePrice = new BigDecimal("99.00");
        this.taxRate = new BigDecimal("0.0200");
        this.totalPrice = new BigDecimal("100.98");
    }

    public UUID getBranchId() {
        return branchId;
    }

    public BigDecimal getUnlockBasePrice() {
        return unlockBasePrice;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
}
