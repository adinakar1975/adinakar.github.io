// Mortgage Calculator Module
(function() {
    // Format loan amount input with $ and commas
    const loanInput = document.getElementById('loanAmount');
    if (loanInput) {
        loanInput.addEventListener('input', function(e) {
            let value = this.value.replace(/[^\d]/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString();
                this.value = value;
            } else {
                this.value = '';
            }
        });
    }

    // Mortgage Calculator logic
    const form = document.getElementById('mortgageForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let loan = loanInput.value.replace(/[^\d]/g, '');
            loan = parseFloat(loan);
            let duration = parseInt(document.getElementById('duration').value);
            const durationType = document.getElementById('durationType').value;
            const rate = parseFloat(document.getElementById('interestRate').value);
            if (durationType === 'years') duration = duration * 12;
            const monthlyRate = rate / 100 / 12;
            let monthlyPayment;
            if (monthlyRate === 0) {
                monthlyPayment = loan / duration;
            } else {
                monthlyPayment = loan * monthlyRate * Math.pow(1 + monthlyRate, duration) / (Math.pow(1 + monthlyRate, duration) - 1);
            }
            // Amortization schedule with correct calculation
            let balance = loan;
            let schedule = [];
            let totalInterest = 0;
            let totalPrincipal = 0;
            for (let i = 1; i <= duration; i++) {
                let interestPayment = monthlyRate === 0 ? 0 : balance * monthlyRate;
                let principalPayment = monthlyPayment - interestPayment;
                if (balance < principalPayment) principalPayment = balance;
                let interestPct = monthlyPayment === 0 ? 0 : (interestPayment / monthlyPayment) * 100;
                let principalPct = monthlyPayment === 0 ? 0 : (principalPayment / monthlyPayment) * 100;
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interestPayment,
                    principalPct: principalPct,
                    interestPct: interestPct,
                    balance: balance - principalPayment
                });
                totalInterest += interestPayment;
                totalPrincipal += principalPayment;
                balance -= principalPayment;
                if (balance < 0.01) break;
            }
            const totalPaid = totalPrincipal + totalInterest;
            document.getElementById('mortgageResult').innerHTML =
                'Monthly Mortgage Payment: <b>$' + (monthlyPayment ? Number(monthlyPayment.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '0.00') + '</b>' +
                '<br><span style="font-weight:bold;">Total Principal Paid: $' + Number(totalPrincipal.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) +
                '<br>Total Interest Paid: $' + Number(totalInterest.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) +
                '<br>Total Amount Paid to Repay Mortgage: $' + Number(totalPaid.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + '</span>';
            // Build table
            let table = '<table style="width:100%;border-collapse:collapse;margin-top:20px;">';
            table += '<thead><tr style="background:#f7f9fa;"><th>Month</th><th>Monthly Payment</th><th>Principal Paid</th><th>Interest Paid</th><th>% Principal</th><th>% Interest</th><th>Balance</th></tr></thead><tbody>';
            schedule.forEach(row => {
                table += `<tr style="text-align:right;border-bottom:1px solid #eee;">
                    <td style="text-align:center;">${row.month}</td>
                    <td>$${Number(monthlyPayment.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td>$${Number(row.principal.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td>$${Number(row.interest.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td>${row.principalPct.toFixed(1)}%</td>
                    <td>${row.interestPct.toFixed(1)}%</td>
                    <td>$${Number(row.balance.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                </tr>`;
            });
            table += `</tbody><tfoot></tfoot></table>`;
            document.getElementById('amortizationSchedule').innerHTML = table;
            // Show the email button only if table is present
            document.getElementById('sendAmortizationEmail').style.display = 'inline-block';
            // Store values for email use
            document.getElementById('sendAmortizationEmail').dataset.loan = Number(loan).toLocaleString();
            document.getElementById('sendAmortizationEmail').dataset.rate = rate;
            document.getElementById('sendAmortizationEmail').dataset.duration = document.getElementById('duration').value + ' ' + document.getElementById('durationType').value;
            document.getElementById('sendAmortizationEmail').dataset.monthly = Number(monthlyPayment.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
            document.getElementById('sendAmortizationEmail').dataset.totalPrincipal = Number(totalPrincipal.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
            document.getElementById('sendAmortizationEmail').dataset.totalInterest = Number(totalInterest.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
            document.getElementById('sendAmortizationEmail').dataset.totalPaid = Number(totalPaid.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
        });
    }
    // EmailJS integration for sending amortization table
    if (typeof emailjs !== 'undefined') {
        emailjs.init('DVhTxcvj8vVKkSfKv'); // Replace with your EmailJS public key if different
    }
    const sendBtn = document.getElementById('sendAmortizationEmail');
    if (sendBtn) {
        sendBtn.onclick = function() {
            let userEmail = prompt('Enter your email address to receive the amortization details:');
            if (!userEmail) return;
            // Gather summary info from dataset
            const loan = sendBtn.dataset.loan;
            const rate = sendBtn.dataset.rate;
            const duration = sendBtn.dataset.duration;
            const monthlyPayment = sendBtn.dataset.monthly;
            const totalPrincipal = sendBtn.dataset.totalPrincipal;
            const totalInterest = sendBtn.dataset.totalInterest;
            const totalPaid = sendBtn.dataset.totalPaid;
            const resultHtml = document.getElementById('mortgageResult').innerHTML;
            const tableHtml = document.getElementById('amortizationSchedule').innerHTML;
            // Prepare EmailJS params
            emailjs.send('service_6twambp', 'template_hwxixog', {
                to_email: userEmail,
                loan_amount: loan,
                interest_rate: rate,
                duration: duration,
                monthly_payment: monthlyPayment,
                total_principal: totalPrincipal,
                total_interest: totalInterest,
                total_paid: totalPaid,
                amortization_table: tableHtml,
            }).then(function() {
                document.getElementById('emailStatus').textContent = 'Email sent!';
            }, function(error) {
                document.getElementById('emailStatus').textContent = 'Failed to send email.';
            });
        };
    }
})();
