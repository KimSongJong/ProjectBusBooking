import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class VNPayEncodingTest {
    public static void main(String[] args) {
        String orderInfo = "Thanh toan don hang";

        System.out.println("=== TEST VNPAY ENCODING ===\n");

        // Test 1: URLEncoder (SAI - over-encoding)
        String urlEncoded = URLEncoder.encode(orderInfo, StandardCharsets.UTF_8);
        System.out.println("1. URLEncoder.encode():");
        System.out.println("   Input:  " + orderInfo);
        System.out.println("   Output: " + urlEncoded);
        System.out.println("   Result: " + urlEncoded.replace("%20", "+"));
        System.out.println("   ❌ Problem: URLEncoder encodes many chars unnecessarily\n");

        // Test 2: Manual replace (ĐÚNG - VNPay yêu cầu)
        String manualEncoded = orderInfo.replace(" ", "+");
        System.out.println("2. Manual .replace(\" \", \"+\"):");
        System.out.println("   Input:  " + orderInfo);
        System.out.println("   Output: " + manualEncoded);
        System.out.println("   ✅ Correct: Only replaces spaces as VNPay requires\n");

        // Test 3: Hash data (phải là RAW)
        System.out.println("3. Hash data (for signature):");
        System.out.println("   vnp_OrderInfo=" + orderInfo);
        System.out.println("   ✅ Must be RAW (no encoding)\n");

        // Test 4: Query string
        System.out.println("4. Query string (for URL):");
        System.out.println("   vnp_OrderInfo=" + manualEncoded);
        System.out.println("   ✅ Only space → +\n");

        // Test with special chars
        String specialChars = "Test: A=B & C/D?E";
        System.out.println("5. Test with special characters:");
        System.out.println("   Input:        " + specialChars);
        System.out.println("   URLEncoder:   " + URLEncoder.encode(specialChars, StandardCharsets.UTF_8));
        System.out.println("   Manual:       " + specialChars.replace(" ", "+"));
        System.out.println("   ❌ URLEncoder encodes :, =, &, /, ? unnecessarily!");
        System.out.println("   ✅ Manual only replaces spaces as needed!");
    }
}

